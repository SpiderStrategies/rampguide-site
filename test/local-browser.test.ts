import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { resolve, extname } from 'node:path'
import { Chrome, chromePath } from '../../rampguide-trust/test/cdp.ts'
import { startDevServer } from '../../rampguide-trust/test/dev-server.ts'

test('local website navigation, keyboard validation and simulated onboarding work at desktop and phone widths', { skip: chromePath() === null ? 'Chrome unavailable' : false }, async () => {
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
    assert.equal(await page.eval("document.querySelector('form').action"), app.base + '/v1/checkout')
    assert.equal(await page.eval('document.documentElement.scrollWidth > innerWidth'), false)
    await page.send('Page.bringToFront')
    await page.eval("document.querySelector('form button').focus(); true")
    await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' })
    await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
    await page.until("document.activeElement?.name === 'org'")
    await page.until("document.activeElement.getBoundingClientRect().bottom <= innerHeight && document.activeElement.getBoundingClientRect().top >= document.querySelector('.nav').getBoundingClientRect().bottom")
    const focusVisible = await page.eval("document.activeElement.getBoundingClientRect().top >= document.querySelector('.nav').getBoundingClientRect().bottom && document.activeElement.getBoundingClientRect().bottom <= innerHeight")
    assert.equal(focusVisible, true, `validation focus clears sticky navigation at ${width}`)
    const fields = { org: `ACME ${width}`, offering: 'RoadRunner', name: 'Avery Collins', email: `avery-${width}@acme.example` }
    for (const [name, value] of Object.entries(fields)) await page.type(`form [name="${name}"]`, value)
    await page.click('form button[type="submit"]')
    await page.until("location.pathname.startsWith('/dev/stripe/checkout/') && document.readyState === 'complete'")
    assert.match(await page.text('main'), /Simulated Stripe, local only/)
    await page.click('button[type="submit"]')
    await page.until("location.pathname === '/welcome.html' && document.readyState === 'complete'")
    assert.equal(await page.eval('window.RG_APP'), app.base)
    assert.match(await page.text('.lede'), /No card was charged/)
    assert.equal(await page.eval('document.documentElement.scrollWidth > innerWidth'), false)
    assert.equal(await page.eval("document.querySelector('a[href$=\"/enroll\"]').href"), app.base + '/enroll')
    await page.click('a[href$="/enroll"]')
    await page.until("location.pathname === '/enroll' && document.readyState === 'complete'")
  }
} finally {
  await chrome?.send('Browser.close', {}, undefined, 1000).catch(() => {})
  chrome?.close(); app.stop(); site.close()
}
})
