import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const MobileToc: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  if (!fileData.toc) {
    return null
  }

  return (
    <details class={classNames(displayClass, "mobile-toc")}> 
      <summary class="mobile-toc-toggle" aria-label="目录">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </summary>
      <nav class="mobile-toc-panel" role="navigation" aria-label="Table of contents">
        <ul>
          {fileData.toc.map((tocEntry) => (
            <li key={tocEntry.slug} class={`depth-${tocEntry.depth}`}>
              <a href={`#${tocEntry.slug}`} data-for={tocEntry.slug}>
                {tocEntry.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  )
}

MobileToc.afterDOMLoaded = `
(function() {
  const closeMobileToc = (toc) => {
    if (toc.hasAttribute("open")) {
      toc.removeAttribute("open")
    }
  }

  document.querySelectorAll(".mobile-toc").forEach((toc) => {
    document.addEventListener(
      "click",
      (event) => {
        if (!toc.hasAttribute("open")) return
        const target = event.target
        if (!(target instanceof Element)) return
        if (!toc.contains(target)) {
          closeMobileToc(toc)
        }
      },
      { capture: true },
    )

    toc.querySelectorAll(".mobile-toc-panel a").forEach((link) => {
      link.addEventListener("click", () => closeMobileToc(toc))
    })
  })
})()
`

export default (() => MobileToc) satisfies QuartzComponentConstructor
