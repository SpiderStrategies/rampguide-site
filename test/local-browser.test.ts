import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { test } from 'node:test'
import { resolve, extname } from 'node:path'
import { Chrome, chromePath } from '../../rampguide-trust/test/cdp.ts'
import { startDevServer } from '../../rampguide-trust/test/dev-server.ts'

test('contact pricing, included company packages and local sign-in work at desktop and phone widths', { skip: chromePath() === null ? 'Chrome unavailable' : false }, async () => {
const root = resolve(import.meta.dirname, '..')
const site = createServer(async (req, res) => {
  const path = new URL(req.url ?? '/', 'http://localhost').pathname
  try {
    const file = resolve(root, '.' + (path === '/' ? '/index.html' : path))
    if (!file.startsWith(root + '/')) throw new Error('invalid path')
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.woff2': 'font/woff2' }[extname(file)] ?? 'application/octet-stream'
    const bytes = await readFile(file)
    res.writeHead(200, { 'content-type': mime }); res.end(bytes)
  } catch { res.writeHead(404); res.end('Not found') }
})
await new Promise<void>(r => site.listen(0, '127.0.0.1', r))
const preview = `http://localhost:${(site.address() as { port: number }).port}`
const app = await startDevServer(['--site', preview])
let chrome: Chrome | undefined
try {
  chrome = await Chrome.launch()
  const page = await chrome.page()
  for (const width of [1440, 390, 320]) {
    await page.viewport(width, width === 1440 ? 1000 : 844)
    await page.goto(`${preview}/?trust=${encodeURIComponent(app.base)}`)
    assert.equal(await page.eval("document.querySelector('.signin').href"), app.base + '/sign-in')
    assert.equal(await page.eval("getComputedStyle(document.querySelector('.signin')).display !== 'none'"), true)
    await page.click('a[href*="product.html"]')
    await page.until("location.pathname === '/product.html' && document.readyState === 'complete'")
    assert.equal(await page.eval('window.RG_APP'), app.base)
    await page.click('nav a[href*="pricing.html"]')
    await page.until("location.pathname === '/pricing.html' && document.readyState === 'complete'")
    assert.equal(await page.eval('document.documentElement.scrollWidth > innerWidth'), false,
      JSON.stringify(await page.eval("[...document.querySelectorAll('main *')].filter(el=>el.getBoundingClientRect().right>innerWidth).map(el=>({tag:el.tagName,class:el.className,width:el.getBoundingClientRect().width,text:el.textContent.slice(0,70)}))")))
    assert.equal(await page.eval("document.querySelectorAll('form, [data-checkout]').length"), 0)
    assert.equal(await page.eval("document.querySelectorAll('article.plan').length"), 1)
    const pricing = (await page.text('main')).replace(/\s+/g, ' ')
    assert.match(pricing, /\$3,000/)
    assert.match(pricing, /Per company/)
    assert.match(pricing, /Unlimited team members and invited readers/)
    assert.match(pricing, /60-minute/)
    assert.match(pricing, /two business days/)
    assert.doesNotMatch(pricing, /\$6,000|\$15,000|Continue to checkout|Complete subscriptions/)
    const contact = await page.eval<string>("document.querySelector('article.plan a.btn').href")
    assert.equal(new URL(contact).protocol, 'mailto:')
    assert.equal(new URL(contact).pathname, 'nathan@spiderstrategies.com')
    // Inspect contact without launching an email client or sending anything.
    await page.send('Page.bringToFront')
    await page.eval("document.querySelector('.faq summary').focus(); true")
    await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' })
    await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
    await page.until("document.querySelector('.faq details').open")
    assert.match(await page.text('.faq details'), /Both are included in your subscription/)
    if (process.env.PRICING_SHOTS) {
      await mkdir(process.env.PRICING_SHOTS, { recursive: true })
      await page.eval('scrollTo(0, 0)')
      await writeFile(resolve(process.env.PRICING_SHOTS, `pricing-${width}.png`), await page.screenshot())
    }
    await page.click('.signin')
    await page.until("location.pathname === '/sign-in' && document.readyState === 'complete'")
    assert.equal(await page.eval('location.origin'), app.base)
    // Bookmarked checkout failures still lead to the current contact offer.
    await page.goto(`${preview}/pricing.html?error=unavailable&trust=${encodeURIComponent(app.base)}`)
    assert.match(await page.text('#checkout-notice'), /Contact us to get started/)
    assert.equal(await page.eval('document.documentElement.scrollWidth > innerWidth'), false,
      JSON.stringify(await page.eval("[...document.querySelectorAll('main *')].filter(el=>el.getBoundingClientRect().right>innerWidth).map(el=>({tag:el.tagName,class:el.className,width:el.getBoundingClientRect().width,text:el.textContent.slice(0,70)}))")))

  }
} finally {
  await chrome?.send('Browser.close', {}, undefined, 1000).catch(() => {})
  chrome?.close(); app.stop(); site.close()
}
})
