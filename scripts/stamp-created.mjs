#!/usr/bin/env node
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { execFileSync } from "node:child_process"
import yaml from "js-yaml"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")

function usage(exitCode = 0) {
  const msg = `
Usage:
  node scripts/stamp-created.mjs [--write] [--dry-run] [--force]
                                [--source filesystem|git|filesystem-then-git|git-then-filesystem]
                                [--format date|datetime]
                                [--content-dir <dir>]
                                [--file <path>]
                                [--limit <n>]

Defaults:
  --dry-run
  --source filesystem-then-git
  --format date
  --content-dir content
`.trim()
  console.log(msg)
  process.exit(exitCode)
}

function getArgValue(flag) {
  const idx = process.argv.indexOf(flag)
  if (idx === -1) return undefined
  return process.argv[idx + 1]
}

function hasFlag(flag) {
  return process.argv.includes(flag)
}

function pad2(n) {
  return String(n).padStart(2, "0")
}

function formatLocalDate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function formatLocalDateTime(d) {
  return `${formatLocalDate(d)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(
    d.getSeconds(),
  )}`
}

function isProbablyInvalidBirthtime(ms) {
  return !Number.isFinite(ms) || ms <= 0
}

function getGitFirstCommitDateIso(relPathPosix) {
  try {
    const out = execFileSync(
      "git",
      ["log", "--follow", "--format=%aI", "--reverse", "--", relPathPosix],
      { cwd: repoRoot, stdio: ["ignore", "pipe", "ignore"] },
    )
      .toString("utf8")
      .trim()
    if (!out) return undefined
    const firstLine = out.split(/\r?\n/)[0].trim()
    return firstLine || undefined
  } catch {
    return undefined
  }
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const ent of entries) {
    if (ent.name.startsWith(".")) continue
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      yield* walk(full)
    } else if (ent.isFile()) {
      yield full
    }
  }
}

function splitFrontmatter(raw) {
  const eol = raw.includes("\r\n") ? "\r\n" : "\n"
  const lines = raw.split(/\r?\n/)
  if (lines[0]?.trim() !== "---") {
    return { hasFrontmatter: false, eol, frontmatterText: "", body: raw }
  }

  const closingIdx = lines.slice(1).findIndex((l) => l.trim() === "---")
  if (closingIdx === -1) {
    return { hasFrontmatter: false, eol, frontmatterText: "", body: raw }
  }

  const endIdx = closingIdx + 1
  const frontmatterText = lines.slice(1, endIdx).join("\n")
  const body = lines.slice(endIdx + 1).join(eol)
  return { hasFrontmatter: true, eol, frontmatterText, body }
}

function buildFrontmatter(existing, createdValue, { force }) {
  const data = existing && typeof existing === "object" ? existing : {}
  const hasCreated = data.created != null || data.date != null
  if (hasCreated && !force) return { changed: false, data }

  const out = {}
  let inserted = false
  for (const [k, v] of Object.entries(data)) {
    out[k] = v
    if (!inserted && k === "title") {
      out.created = createdValue
      inserted = true
    }
  }
  if (!inserted) out.created = createdValue
  return { changed: true, data: out }
}

async function main() {
  if (hasFlag("--help") || hasFlag("-h")) usage(0)

  const write = hasFlag("--write")
  const dryRun = hasFlag("--dry-run") || !write
  const force = hasFlag("--force")
  const source = getArgValue("--source") ?? "filesystem-then-git"
  const format = getArgValue("--format") ?? "date"
  const contentDir = getArgValue("--content-dir") ?? "content"
  const onlyFile = getArgValue("--file")
  const limitRaw = getArgValue("--limit")
  const limit = limitRaw ? Number(limitRaw) : undefined

  if (!["filesystem", "git", "filesystem-then-git", "git-then-filesystem"].includes(source)) {
    console.error(`Invalid --source: ${source}`)
    usage(2)
  }
  if (!["date", "datetime"].includes(format)) {
    console.error(`Invalid --format: ${format}`)
    usage(2)
  }
  if (limit !== undefined && (!Number.isFinite(limit) || limit <= 0)) {
    console.error(`Invalid --limit: ${limitRaw}`)
    usage(2)
  }

  const root = path.resolve(repoRoot, contentDir)
  const touched = []
  const skipped = []
  const failed = []

  const files = []
  if (onlyFile) {
    files.push(path.resolve(repoRoot, onlyFile))
  } else {
    for await (const fullPath of walk(root)) files.push(fullPath)
  }

  for (const fullPath of files) {
    if (!fullPath.toLowerCase().endsWith(".md")) continue
    if (limit !== undefined && touched.length >= limit) break

    const raw = await fs.readFile(fullPath, "utf8")
    const { hasFrontmatter, eol, frontmatterText, body } = splitFrontmatter(raw)
    let fm = {}
    if (hasFrontmatter && frontmatterText.trim() !== "") {
      try {
        fm = yaml.load(frontmatterText) ?? {}
      } catch (e) {
        failed.push({ fullPath, reason: "invalid YAML frontmatter" })
        continue
      }
    }

    const alreadyHasCreated = fm && typeof fm === "object" && (fm.created != null || fm.date != null)
    if (alreadyHasCreated && !force) {
      skipped.push(fullPath)
      continue
    }

    const relPathPosix = path.relative(repoRoot, fullPath).split(path.sep).join(path.posix.sep)

    let createdMs = undefined
    let createdIso = undefined

    const tryFilesystem = async () => {
      const st = await fs.stat(fullPath)
      if (!isProbablyInvalidBirthtime(st.birthtimeMs)) {
        createdMs = st.birthtimeMs
      }
    }
    const tryGit = async () => {
      const iso = getGitFirstCommitDateIso(relPathPosix)
      if (!iso) return
      const dt = new Date(iso)
      if (!Number.isFinite(dt.getTime())) return
      createdIso = iso
    }

    if (source === "filesystem") {
      await tryFilesystem()
    } else if (source === "git") {
      await tryGit()
    } else if (source === "filesystem-then-git") {
      await tryFilesystem()
      if (createdMs === undefined) await tryGit()
    } else if (source === "git-then-filesystem") {
      await tryGit()
      if (createdIso === undefined) await tryFilesystem()
    }

    const createdDate = createdMs !== undefined ? new Date(createdMs) : createdIso ? new Date(createdIso) : undefined
    if (!createdDate) {
      failed.push({ fullPath, reason: "could not determine created time" })
      continue
    }

    const createdValue = format === "datetime" ? formatLocalDateTime(createdDate) : formatLocalDate(createdDate)
    const nextFm = buildFrontmatter(fm, createdValue, { force })
    if (!nextFm.changed && !force) {
      skipped.push(fullPath)
      continue
    }

    const dumped = yaml.dump(nextFm.data, { lineWidth: -1, noRefs: true, sortKeys: false }).trimEnd()
    const nextRaw =
      `---${eol}` + (dumped ? dumped + eol : "") + `---${eol}${hasFrontmatter ? "" : eol}` + body

    if (!dryRun) {
      await fs.writeFile(fullPath, nextRaw, "utf8")
    }
    touched.push({ fullPath, createdValue })
  }

  for (const { fullPath, createdValue } of touched.slice(0, 30)) {
    console.log(`${dryRun ? "[dry-run] " : ""}${path.relative(repoRoot, fullPath)} -> created: ${createdValue}`)
  }
  if (touched.length > 30) console.log(`... and ${touched.length - 30} more`)
  console.log("")
  console.log(`Modified: ${touched.length}`)
  console.log(`Skipped: ${skipped.length}`)
  console.log(`Failed: ${failed.length}`)
  if (failed.length) {
    for (const f of failed.slice(0, 10)) console.log(`- ${path.relative(repoRoot, f.fullPath)} (${f.reason})`)
    if (failed.length > 10) console.log(`... and ${failed.length - 10} more`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
