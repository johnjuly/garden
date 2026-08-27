import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { classNames } from "../util/lang"
import style from "./styles/homeHero.scss"

interface HeroLink {
  label: string
  slug: FullSlug
}

interface Options {
  title: string
  subtitle: string
  links: HeroLink[]
}

const defaultOptions: Options = {
  title: "Bienvenue!",
  subtitle: "欢迎来到john的数字花园^-^ 这里主要记录网上的见闻以及课堂的笔记。路径是以 PIAA 的方式来整理的。",
  links: [
    { label: "关于", slug: "about" as FullSlug },
    { label: "友链", slug: "04-Archieves/friends" as FullSlug },
    { label: "标签", slug: "tags" as FullSlug },
    { label: "碎语", slug: "碎语" as FullSlug },
    { label: "RSS", slug: "index.xml" as FullSlug },
  ],
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }
  const HomeHero: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    return (
      <div class={classNames(displayClass, "home-hero")}>
        <h1 class="home-hero-title">{opts.title}</h1>
        <p class="home-hero-subtitle">{opts.subtitle}</p>
        <ul class="home-hero-links">
          {opts.links.map((link) => (
            <li>
              <a class="internal" href={resolveRelative(fileData.slug!, link.slug)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  HomeHero.css = style
  return HomeHero
}) satisfies QuartzComponentConstructor
