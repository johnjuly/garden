import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, joinSegments, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { byDateAndAlphabetical } from "./PageList"
import { Date, getDate } from "./Date"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"
import style from "./styles/folderCards.scss"

interface FolderCardConfig {
  folder: string
  title: string
  description: string
}

interface Options {
  cards: FolderCardConfig[]
  recentLimit: number
}

const defaultOptions: Options = {
  cards: [
    {
      folder: "01-Projects",
      title: "Projects",
      description: "课程与项目：CS144 / CSAPP / Linux 系统编程 / STL / LeetCode",
    },
    {
      folder: "02-Inbox",
      title: "Inbox",
      description: "临时想法与待整理内容",
    },
    {
      folder: "03-Areas",
      title: "Areas",
      description: "计算机科学、工具、音乐、语言、上网见闻、生活",
    },
    {
      folder: "04-Archieves",
      title: "Archives",
      description: "归档：看世界、物联网安全、友链",
    },
  ],
  recentLimit: 3,
}

// files belonging to a folder: exact prefix match, exclude the folder index page
function folderPages(allFiles: QuartzPluginData[], folder: string): QuartzPluginData[] {
  return allFiles.filter((f) => {
    const slug = f.slug ?? ""
    return slug.startsWith(folder + "/") && !slug.endsWith("/index")
  })
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }
  const FolderCards: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    return (
      <div class={classNames(displayClass, "folder-cards")}>
        {opts.cards.map((card) => {
          const pages = folderPages(allFiles, card.folder)
          const recent = pages.sort(byDateAndAlphabetical(cfg)).slice(0, opts.recentLimit)
          const folderSlug = joinSegments(card.folder, "index") as FullSlug
          return (
            <div class="folder-card">
              <a class="folder-card-header" href={resolveRelative(fileData.slug!, folderSlug)}>
                <h2 class="folder-card-title">{card.title}</h2>
              </a>
              <p class="folder-card-desc">{card.description}</p>
              <p class="folder-card-count">{pages.length} 篇</p>
              <ul class="folder-card-recent">
                {recent.map((page) => (
                  <li>
                    <a class="internal" href={resolveRelative(fileData.slug!, page.slug!)}>
                      {page.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title}
                    </a>
                    {page.dates && (
                      <span class="meta">
                        {(() => {
                          const date = getDate(cfg, page)
                          return date ? <Date date={date} locale={cfg.locale} /> : null
                        })()}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    )
  }

  FolderCards.css = style
  return FolderCards
}) satisfies QuartzComponentConstructor
