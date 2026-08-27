import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { classNames } from "../util/lang"
import style from "./styles/mastodonTimeline.scss"

// 碎语页面上的 Mastodon 时间线，基于 mastodon-embed-timeline (v4.7.0)
// 库文件 vendored 在 static/，页面加载后由前端实时从实例 API 拉取
export default (() => {
  const MastodonTimeline: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const libPath = resolveRelative(fileData.slug!, "static/mastodon-timeline.umd.js" as FullSlug)
    const cssPath = resolveRelative(fileData.slug!, "static/mastodon-timeline.min.css" as FullSlug)
    return (
      <div class={classNames(displayClass, "mastodon-timeline")}>
        <link rel="stylesheet" href={cssPath} />
        {/* 库要求容器内必须有 .mt-body 结构（getElementsByClassName 查找），容器本身需带 mt-container 类 */}
        <div id="mt-container" class="mt-container" data-lib={libPath}>
          <div class="mt-body" role="feed">
            <div class="mt-loading-spinner" />
          </div>
        </div>
        <noscript>
          <p>
            需要启用 JavaScript 才能显示碎语时间线，也可以直接前往{" "}
            <a href="https://m.cmx.im/@johnjuly" rel="me">
              Mastodon 主页
            </a>
            查看。
          </p>
        </noscript>
      </div>
    )
  }

  MastodonTimeline.css = style
  MastodonTimeline.afterDOMLoaded = `
    const currentTheme = () =>
      document.documentElement.getAttribute("saved-theme") === "dark" ? "dark" : "light"

    function mountMtTimeline() {
      const el = document.getElementById("mt-container")
      if (!el || el.dataset.mtLoaded) return
      el.dataset.mtLoaded = "1"

      const init = () => {
        window.mtTimeline = new window.MastodonTimeline.Init({
          mtContainerId: "mt-container",
          instanceUrl: "https://cmx.go.it",
          timelineType: "profile",
          userId: "116429772469899586",
          profileName: "@johnjuly",
          defaultTheme: currentTheme(),
          maxNbPostFetch: "60",
          maxNbPostShow: "60",
          dateFormatLocale: "zh-CN",
          hideReblog: true,
          hideReplies: true,
          hidePinnedPosts: true,
          hideUnlisted: false,
          hideCounterBar: true,
          btnSeeMore: "",
          btnReload: "",
          insistSearchContainer: true,
          insistSearchContainerTime: "3000",
        })
      }

      if (window.MastodonTimeline) {
        init()
      } else {
        const s = document.createElement("script")
        s.src = el.dataset.lib
        s.onload = init
        s.onerror = () => console.error("加载 Mastodon 时间线库失败")
        document.body.appendChild(s)
      }
    }

    // 首次整页加载
    mountMtTimeline()
    // SPA 路由切换后新容器没有 mtLoaded 标记，自动重新挂载
    document.addEventListener("nav", mountMtTimeline)
    // 跟随博客明暗主题切换
    document.addEventListener("themechange", (e) => {
      const theme = e.detail && e.detail.theme ? e.detail.theme : currentTheme()
      if (window.mtTimeline && typeof window.mtTimeline.mtColorTheme === "function") {
        window.mtTimeline.mtColorTheme(theme)
      }
    })
  `
  return MastodonTimeline
}) satisfies QuartzComponentConstructor
