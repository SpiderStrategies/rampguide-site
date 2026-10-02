import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'

const script = readFileSync(new URL('../local-app.js', import.meta.url), 'utf8')
function preview(href, storage = new Map()) {
  const location = new URL(href)
  const links = ['/product.html', '/pricing.html', 'https://trust.rampguide.com/', 'https://trust.rampguide.com/v1/openapi.json'].map((href, i) => ({
    href: new URL(href, location).href,
    classList: { contains: (name) => name === 'signin' && i === 2 },
  }))
  const form = { action: 'https://trust.rampguide.com/v1/checkout' }
  const window = {}
  runInNewContext(script, {
    URL, URLSearchParams, location, window,
    sessionStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    document: { querySelectorAll: (selector) => selector === 'a[href]' ? links : [form] },
  })
  return { links, form, app: window.RG_APP }
}

test('local navigation, new tabs and storage retain the chosen application for sign-in and checkout', () => {
  const storage = new Map()
  const first = preview('http://localhost:4180/?trust=http://localhost:8810', storage)
  assert.equal(first.app, 'http://localhost:8810')
  const next = preview(first.links[0].href) // fresh tab, no stored choice
  assert.equal(next.app, first.app)
  assert.equal(next.links[2].href, first.app + '/sign-in')
  assert.equal(next.links[3].href, first.app + '/v1/openapi.json')
  assert.equal(next.form.action, first.app + '/v1/checkout')
  assert.equal(preview('http://localhost:4180/product.html', storage).app, first.app)
})

test('local overrides must be plain loopback HTTP(S) origins', () => {
  for (const value of ['https://evil.example', 'javascript:alert(1)', 'http://localhost.evil.example', 'http://user:secret@localhost:8810', 'http://localhost:8810/path', 'http://localhost:8810?x=1', 'http://localhost:8810#x', '//localhost:8810']) {
    assert.equal(preview('http://localhost:4180/?trust=' + encodeURIComponent(value)).app, 'http://localhost:8790', value)
  }
  assert.equal(preview('http://[::1]:4180/?trust=http://[::1]:8810').app, 'http://[::1]:8810')
})

test('production ignores both query overrides and stored preview configuration', () => {
  const result = preview('https://rampguide.com/?trust=http://localhost:8810', new Map([['rampguide-preview-app', 'http://localhost:8811']]))
  assert.equal(result.app, 'https://trust.rampguide.com')
  assert.equal(result.form.action, 'https://trust.rampguide.com/v1/checkout')
  assert.equal(result.links[2].href, 'https://trust.rampguide.com/sign-in')
  assert.equal(new URL(result.links[0].href).search, '')
})
