import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import style from "./styles/memosTimeline.scss"

// 动态页面上的 Memos 时间线：页面加载后由前端实时从自建 memos 实例拉取。
// 服务器已开启公开模式，匿名只能读到 PUBLIC 可见性的 memo，PRIVATE 不受影响；
// 拉取用 creatorId + visibility 双重过滤，接口与附件都走 https（避免混合内容）。
// 若要更换 memos 地址（如子域名不同），只需改这一处常量。
const MEMOS_BASE = "https://memos.cielbleu.top"

export default (() => {
  const MemosTimeline: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    return (
      <div class={classNames(displayClass, "memos-timeline")}>
        <div class="memos-list" role="feed">
          <div class="memos-loading">加载动态中…</div>
        </div>
        <noscript>
          <p>
            需要启用 JavaScript 才能显示动态，也可以直接前往{" "}
            <a href={MEMOS_BASE} target="_blank" rel="noopener">
              Memos 主页
            </a>
            查看。
          </p>
        </noscript>
      </div>
    )
  }

  MemosTimeline.css = style
  // 注意：这段脚本会原样内联进页面。为避免外层模板字符串转义出错，
  // 生成代码里不使用反引号和 ${}，字符串一律用 + 拼接。
  MemosTimeline.afterDOMLoaded = `
    ;(() => {
      const MEMOS_BASE = "${MEMOS_BASE}"

      const escapeHtml = (s) =>
        s.replace(
          /[&<>"']/g,
          (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
        )

      const absoluteUrl = (url) => {
        if (/^https?:\\/\\//i.test(url)) return url
        return MEMOS_BASE + (url.startsWith("/") ? url : "/" + url)
      }

      // 迷你 markdown 渲染：内容先整体转义，再依次处理
      // 图片 -> 链接 -> 行内代码/加粗/斜体 -> 裸链接 -> #标签，最后空行分段。
      const renderLine = (line) => {
        let html = line
        // ![alt](url) -> 可点击图片（灯箱由全局点击处理）
        html = html.replace(/!\\[([^\\]]*)\\]\\(([^)\\s]+)\\)/g, (_, alt, url) => {
          const src = absoluteUrl(url)
          return (
            '<a class="memo-img" href="' +
            src +
            '"><img src="' +
            src +
            '" alt="' +
            alt +
            '" loading="lazy"></a>'
          )
        })
        // [text](url) -> 外链
        html = html.replace(/\\[([^\\]]+)\\]\\((https?:\\/\\/[^)\\s]+|\\/[^)\\s]+)\\)/g, (_, text, url) => {
          return (
            '<a href="' +
            absoluteUrl(url) +
            '" target="_blank" rel="noopener">' +
            text +
            "</a>"
          )
        })
        // 行内代码 / 加粗 / 斜体
        html = html.replace(/\\\`([^\\\`\\n]+)\\\`/g, "<code>$1</code>")
        html = html.replace(/\\*\\*([^*]+)\\*\\*/g, "<strong>$1</strong>")
        html = html.replace(/(?<!\\*)\\*([^*\\n]+)\\*(?!\\*)/g, "<em>$1</em>")
        // 裸链接（不碰已生成的 href/src 属性值：前面是引号或等号时不匹配）
        html = html.replace(/(?<![="])(https?:\\/\\/[^\\s<>"')\\]]+)/g, (_, url) => {
          return '<a href="' + url + '" target="_blank" rel="noopener">' + url + "</a>"
        })
        // #标签（# 后跟非空白才算标签，markdown 标题的 "# 文字" 不受影响；
        // 前导上下文含中文标点，覆盖「。！#tag」这类常见中文写法，且不会出现在 URL 片段前）
        html = html.replace(/(^|[\\s(（。，！？；：、」「』）])#([^\\s#]+)/g, '$1<span class="memo-tag">#$2</span>')
        return html
      }

      // 空行分段，段内单换行转 <br>
      const renderContent = (md) =>
        escapeHtml(md)
          .split(/\\n{2,}/)
          .filter((block) => block.trim() !== "")
          .map((block) => {
            return (
              "<p>" +
              block
                .split("\\n")
                .map((line) => renderLine(line))
                .join("<br>") +
              "</p>"
            )
          })
          .join("")

      const formatTime = (iso) => {
        const diff = Date.now() - new Date(iso).getTime()
        const min = Math.floor(diff / 60000)
        if (min < 1) return "刚刚"
        if (min < 60) return min + " 分钟前"
        const hr = Math.floor(min / 60)
        if (hr < 24) return hr + " 小时前"
        const day = Math.floor(hr / 24)
        if (day < 30) return day + " 天前"
        return new Date(iso).toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }

      const render = (memos) => {
        const listEl = document.querySelector(".memos-timeline .memos-list")
        if (!listEl) return
        listEl.innerHTML = memos
          .map((m) => {
            return (
              '<article class="memo-card">' +
              '<div class="memo-content">' +
              renderContent(m.content) +
              "</div>" +
              '<time class="memo-time" datetime="' +
              m.createTime +
              '">' +
              formatTime(m.createTime) +
              "</time>" +
              "</article>"
            )
          })
          .join("")
      }

      const load = async () => {
        const listEl = document.querySelector(".memos-timeline .memos-list")
        if (!listEl) return
        listEl.innerHTML = '<div class="memos-loading">加载动态中…</div>'
        try {
          const res = await fetch(
            MEMOS_BASE +
              "/api/v1/memos?creatorId=users/johnjuly&visibility=PUBLIC&limit=100",
            { cache: "no-store" },
          )
          if (!res.ok) throw new Error("HTTP " + res.status)
          const data = await res.json()
          const memos = (data.memos || []).filter((m) => m.state === "NORMAL")
          if (memos.length === 0) {
            listEl.innerHTML = '<p class="memos-empty">还没有动态。</p>'
            return
          }
          render(memos)
        } catch (err) {
          listEl.innerHTML =
            '<p class="memos-error">动态加载失败，可以<a href="' +
            MEMOS_BASE +
            '" target="_blank" rel="noopener">前往 Memos</a>查看。</p>'
        }
      }

      // 灯箱：点图片打开全屏查看，点任意处（含图片自身）即关闭；Esc 也可关闭
      document.addEventListener("click", (e) => {
        const t = e.target
        if (!(t instanceof Element)) return
        const lightbox = document.querySelector(".memos-lightbox")
        if (lightbox) {
          lightbox.remove()
          return
        }
        const img = t.closest(".memo-img")
        if (img && img instanceof HTMLAnchorElement) {
          e.preventDefault()
          const lb = document.createElement("div")
          lb.className = "memos-lightbox"
          const im = document.createElement("img")
          im.src = img.href
          im.alt = img.querySelector("img") ? img.querySelector("img").alt : ""
          lb.appendChild(im)
          document.body.appendChild(lb)
        }
      })
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          const lb = document.querySelector(".memos-lightbox")
          if (lb) lb.remove()
        }
      })

      // 首次整页加载；SPA 路由切换后重新拉取保持最新
      load()
      document.addEventListener("nav", load)
    })()
  `
  return MemosTimeline
}) satisfies QuartzComponentConstructor
