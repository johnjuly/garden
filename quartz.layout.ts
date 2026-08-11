import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.Comments({
      provider: "giscus",
      options: {
        // from data-repo
        repo: "johnjuly/garden",
        // from data-repo-id
        repoId: "R_kgDOPt4QIA",
        // from data-category
        category: "Announcements",
        // from data-category-id
        categoryId: "DIC_kwDOPt4QIM4Cwk7Q",
        // from data-lang
        lang: "zh-CN",
      },
    }),
  ],
  footer: Component.Footer({
    links: {
      "←": "https://xn--sr8hvo.ws/previous",
      "🕸💍": "https://xn--sr8hvo.ws",
      "→": "https://xn--sr8hvo.ws/next",
      GitHub: {
        url: "https://github.com/johnjuly",
        rel: "me",
      },
      "⁂": "https://m.cmx.im/@johnjuly",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.MobileOnly(Component.Flex({
      direction: "row",
      wrap: "nowrap",
      gap: "0.75rem",
      components: [
        { Component: Component.MobileToc() },
        {
          Component: Component.PageTitle(),
          grow: true,
          align: "stretch",
        },
        {
          Component: Component.Flex({
            direction: "row",
            gap: "0.5rem",
            components: [
              { Component: Component.Search() },
              { Component: Component.Darkmode() },
            ],
          }),
          basis: "auto",
          align: "stretch",
        },
      ],
    })),
    Component.DesktopOnly(Component.PageTitle()),
    Component.DesktopOnly(Component.Flex({
      direction: "row",
      wrap: "wrap",
      gap: "0.5rem",
      components: [
        {
          Component: Component.Search(),
          basis: "0",
          grow: true,
          align: "stretch",
        },
        {
          Component: Component.Flex({
            gap: "0.5rem",
            components: [
              { Component: Component.Darkmode() },
              { Component: Component.DesktopOnly(Component.ReaderMode()) },
            ],
          }),
          basis: "auto",
          align: "stretch",
        },
      ],
    })),
    Component.DesktopOnly(Component.RecentNotes({ limit: 4, linkToMore: "tags" })),
  ],
  right: [Component.DesktopOnly(Component.TableOfContents()),
    Component.DesktopOnly(Component.Graph()),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      direction: "column",
      gap: "0.5rem",
      components: [
        {
          Component: Component.Search(),
          basis: "100%",
          align: "stretch",
        },
        {
          Component: Component.Darkmode(),
          basis: "100%",
          align: "stretch",
        },
      ],
    }),
    Component.DesktopOnly(Component.RecentNotes({ linkToMore: "tags" })),
  ],
  right: [],
}
