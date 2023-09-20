import fs from 'fs';
import { resolve, basename } from 'path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

type Chapter = {
  number: number
  title: string
  html: string
}

export default defineConfig(({ mode }) => {
  const loadFile = (path: string) => fs.readFileSync(resolve(__dirname, path), 'utf-8')

  const headCommon = loadFile('partials/head.html')
  const workTitle = loadFile('metadata/title.txt').trim()
  const summary = loadFile('metadata/summary.html').trim()
  const siteUrl = loadFile('metadata/site-url.txt').trim()
  const ao3Url = loadFile('metadata/ao3-url.txt').trim()

  const base = mode === 'production'
    ? siteUrl
    : '/'

  const getChapterNumberFromFilename = (filename: string) => parseInt(basename(filename).split('.')[0], 10)
  const getChapterPath = ({ number }: Pick<Chapter, 'number'>) => `pages/${number}.html`
  const getChapterHref = (chapter: Chapter | null) => chapter ? base + getChapterPath(chapter) : ''

  const chapterFilenames = fs.readdirSync(resolve(__dirname, 'pages'))
    .filter((page) => /^\d+\.html$/.test(page))
    .sort((a, b) => getChapterNumberFromFilename(a) - getChapterNumberFromFilename(b))

  const chapters: Chapter[] = chapterFilenames.map((filename) => {
    const number = getChapterNumberFromFilename(filename)

    const html = loadFile(getChapterPath({ number }))
    const lines = html.split('\n')
    const title = lines[0]
    const htmlWithoutTitle = lines.slice(1).join('\n')

    return { number, title, html: htmlWithoutTitle }
  })

  const lastChapterNumber = chapters[chapters.length - 1].number

  const getRelativeChapters = (chapterNumber: number) => {
    const isFirst = chapterNumber === 1
    const isLast = chapterNumber === lastChapterNumber

    return {
      firstChapter: isFirst ? null : chapters[0],
      previousChapter: isFirst ? null : chapters[chapterNumber - 2],
      currentChapter: chapters[chapterNumber - 1],
      nextChapter: isLast ? null : chapters[chapterNumber],
      lastChapter: isLast ? null : chapters[lastChapterNumber - 1],
    }
  }

  const preProcessHtml = (html: string) => html
    .replaceAll('$HEAD_COMMON', headCommon)

  const postProcessHtml = (html: string) => html
    .replaceAll('$BASE', base)

  const processHtml = (
    html: string,
    transform: (html: string) => string = (html) => html,
  ) => postProcessHtml(transform(preProcessHtml(html)))

  return {
    base,
    plugins: [
      {
        name: 'custom-plugin',
        transformIndexHtml: {
          order: 'pre',
          transform: (html, { filename, path }) => {
            if (path === '/index.html') {
              return processHtml(html, (html) => html
                .replaceAll('$WORK_TITLE', workTitle)
                .replaceAll('$SUMMARY', summary)
                .replaceAll('$AO3_URL', ao3Url)
              )
            }

            if (path === '/toc.html') {
              const items = chapters.map((chapter) => loadFile('partials/toc-item.html')
                .replaceAll('$HREF', getChapterHref(chapter))
                .replaceAll('$LABEL', chapter.title)
              ).join('')

              return processHtml(html, (html) => html
                .replaceAll('$ITEMS', items)
              )
            }

            if (path.startsWith('/pages/')) {
              const {
                firstChapter,
                previousChapter,
                currentChapter,
                nextChapter,
                lastChapter,
              } = getRelativeChapters(getChapterNumberFromFilename(filename))

              const titleWithNumber = `Chapter ${currentChapter.number}: ${currentChapter.title}`
              const chapterDescription = `${currentChapter.number} of ${lastChapterNumber}`

              return processHtml(loadFile('chapter.html'), (html) => html
                .replaceAll('$CHAPTER_NAV', loadFile('partials/chapter-nav.html'))
                .replaceAll('$PAGE_TITLE', titleWithNumber)
                .replaceAll('$CHAPTER_DESCRIPTION', chapterDescription)
                .replaceAll('$FIRST_CHAPTER_HREF', getChapterHref(firstChapter))
                .replaceAll('$PREVIOUS_CHAPTER_HREF', getChapterHref(previousChapter))
                .replaceAll('$NEXT_CHAPTER_HREF', getChapterHref(nextChapter))
                .replaceAll('$LAST_CHAPTER_HREF', getChapterHref(lastChapter))
                .replaceAll('$PAGE_CONTENT', currentChapter.html)
              )
            }

            return html
          },
        },
        config: (config) => {
          const chapterInputs = Object.fromEntries(chapters.map((chapter) => [
            chapter.number,
            getChapterPath(chapter),
          ]))

          return {
            ...config,
            build: {
              ...config.build,
              rollupOptions: {
                ...config.build?.rollupOptions,
                input: {
                  index: resolve(__dirname, 'index.html'),
                  toc: resolve(__dirname, 'toc.html'),
                  ...chapterInputs,
                }
              },
            },
          }
        },
      },
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: workTitle,
          short_name: workTitle,
          display: 'minimal-ui',
          icons: [
            {
              src: '/icon.png',
              sizes: '180x180',
              type: 'image/png',
            },
          ],
        },
      }),
    ],
    server: {
      port: 3000,
    },
  }
})
