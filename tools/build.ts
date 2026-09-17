// Build the site's pages from src/ — the only "framework" this repo has.
//
//   node tools/build.ts          write every page to the repo root
//   node tools/build.ts --check  exit 1 if any root page differs from a fresh build
//
// A page in src/ is ordinary HTML plus two things: a JSON block at the top
// (`<!-- page {...} -->`) holding its variables, and include markers
// (`<!-- include: nav -->`) that pull a file from src/partials/. Partials
// and pages may use {{name}} placeholders for the page's variables. There
// is no logic beyond that; anything conditional is computed here, in one
// place, from the variables (the social tags, the robots tag, the
// canonical link). No dependencies — Node ≥ 22 runs this as is.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const src = join(root, 'src')
const partialsDir = join(src, 'partials')
const check = process.argv.includes('--check')

interface Page {
  title: string
  description: string
  /** page path on rampguide.com, e.g. "pricing.html" ("" for the home page) */
  path: string
  og?: { title: string; description: string }
  noindex?: boolean
  referrer?: string
  /** a sentence appended to the footer's legal line */
  legal?: string
  [key: string]: unknown
}

const SITE = 'https://rampguide.com/'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')

function derived(page: Page): Record<string, string> {
  const url = SITE + page.path
  const social = page.og
    ? [
        `<meta property="og:title" content="${esc(page.og.title)}">`,
        `<meta property="og:description" content="${esc(page.og.description)}">`,
        `<meta property="og:url" content="${url}">`,
        '<meta property="og:type" content="website">',
        '<meta property="og:image" content="https://rampguide.com/og.png">',
        '<meta name="twitter:card" content="summary_large_image">',
      ].join('\n')
    : ''
  return {
    social,
    robots: page.noindex ? '<meta name="robots" content="noindex">' : '',
    referrer: page.referrer ?? 'strict-origin-when-cross-origin',
    canonical: page.path === '' ? `<link rel="canonical" href="${SITE}">` : '',
    legal: page.legal ?? '',
    title: esc(page.title),
    description: esc(page.description),
  }
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (whole, name: string) => {
    if (!(name in vars)) throw new Error(`unknown variable {{${name}}}`)
    return vars[name]
  })
}

function build(file: string): { out: string; html: string } {
  const source = readFileSync(join(src, file), 'utf8')
  const header = source.match(/^<!-- page (\{[\s\S]*?\}) -->\n/)
  if (!header) throw new Error(`${file}: missing the <!-- page {...} --> header`)
  const page = JSON.parse(header[1]) as Page
  const vars = derived(page)
  let body = source.slice(header[0].length)
  body = body.replace(/<!-- include: ([\w-]+) -->/g, (_, name: string) =>
    fill(readFileSync(join(partialsDir, `${name}.html`), 'utf8').replace(/\n$/, ''), vars),
  )
  // blank lines left by empty variables (no social tags, no robots) collapse
  let html = fill(body, vars).replace(/\n{3,}/g, '\n\n').replace(/^\n+(?=<!doctype)/, '')
  const headEnd = html.indexOf('</head>')
  html = html.slice(0, headEnd).replace(/\n\n(?=<)/g, '\n') + html.slice(headEnd)
  return { out: page.path === '' ? 'index.html' : page.path, html }
}

let failed = false
for (const file of readdirSync(src).filter((f) => f.endsWith('.html')).sort()) {
  const { out, html } = build(file)
  const target = join(root, out)
  if (check) {
    let current = ''
    try {
      current = readFileSync(target, 'utf8')
    } catch {}
    if (current !== html) {
      failed = true
      console.error(`stale: ${out} differs from a fresh build of src/${file}`)
    }
  } else {
    writeFileSync(target, html)
    console.log(`${out} ← src/${file}`)
  }
}
if (check) {
  if (failed) {
    console.error('run `node tools/build.ts` and commit the result')
    process.exit(1)
  }
  console.log('every page matches its source')
}
