/**
 * Offline verification for the Miku skin.
 *
 * Runs the built browser bundle against a small fake DOM/React/Cordis runtime
 * to prove the registration surface, checks the palette covers the complete
 * 0.2.1-rc.2 token set, proves the runtime carries no image or network assets
 * (the README preview under docs/ is documentation only), and checks the core
 * WCAG contrast pairs. No browser, profile, or network is required.
 */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, extname, join, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import vm from 'node:vm'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const read = (path) => readFileSync(join(root, path), 'utf8')
const pkg = JSON.parse(read('package.json'))
const snapshot = JSON.parse(read('scripts/token-snapshot.json'))
const css = read('src/client/styles.css')
const clientSource = read('src/client/index.js')
const bundle = read('lib/client.js')
const patch = read('cordis.patch.yml')

let passed = 0
function check(name, fn) {
  try {
    fn()
    passed += 1
    console.log(`ok   ${name}`)
  } catch (error) {
    console.error(`FAIL ${name}`)
    throw error
  }
}

/* ---------------------------------------------------------------- *
 * Package wiring
 * ---------------------------------------------------------------- */

check('package declares the web client half', () => {
  assert.equal(pkg.name, 'dsh-plugin-miku-skin')
  assert.equal(pkg.dsh.client.platform, 'web')
  assert.equal(pkg.dsh.client.immediately, undefined)
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(pkg.exports['./client'], './lib/client.js')
  assert.equal(pkg.exports['.'], './lib/index.js')
})

check('package metadata is release-ready', () => {
  assert.equal(pkg.private, undefined)
  assert.equal(pkg.author.name, 'INKEM')
  assert.equal(pkg.author.url, 'https://github.com/INKEM')
  assert.equal(pkg.repository.url, 'git+https://github.com/INKEM/dsh-plugin-miku-skin.git')
  assert.equal(pkg.homepage, 'https://github.com/INKEM/dsh-plugin-miku-skin#readme')
  assert.equal(pkg.bugs.url, 'https://github.com/INKEM/dsh-plugin-miku-skin/issues')
  assert.equal(pkg.license, 'MIT')
  assert.ok(pkg.engines.dsh.includes('0.2.1-rc.2'), 'engines.dsh must allow the current baseline')
  assert.ok(pkg.engines.node.includes('22'), 'engines.node must allow the current runtime')
  assert.equal(pkg.publishConfig.access, 'public')
  assert.equal(pkg.publishConfig.registry, 'https://registry.npmjs.org/')
  assert.ok(pkg.files.includes('assets'), 'files must ship the package icon')
  assert.ok(pkg.files.includes('docs'), 'files must ship the README preview')
})

check('package icon is a self-contained SVG', () => {
  assert.equal(pkg.icon, 'assets/icon.svg')
  assert.equal(pkg.exports['./icon'], './assets/icon.svg')
  const icon = read('assets/icon.svg')
  assert.match(icon, /^<svg\b/)
  assert.ok(Buffer.byteLength(icon) < 256 * 1024, 'icon exceeds the manifest limit')
  assert.ok(!/<image\b/i.test(icon), 'icon must not embed an image')
  assert.ok(!/<script\b/i.test(icon), 'icon must not embed a script')
  assert.ok(!/\b(?:xlink:)?href\s*=/i.test(icon), 'icon must not reference external content')
})

check('bundle patch replaces the official brand occupants', () => {
  assert.match(patch, /id:\s*ui-brand-official\s*\n\s*disabled:\s*true/)
  assert.match(patch, /id:\s*miku-skin\s*\n\s*name:\s*'dsh-plugin-miku-skin'/)
})

const host = await import(pathToFileURL(join(root, 'lib/index.js')).href)

check('host half exports apply and name', () => {
  assert.equal(typeof host.apply, 'function')
  assert.equal(host.name, 'dsh-plugin-miku-skin')
})

check('locale metadata exists in English and Chinese', () => {
  const en = JSON.parse(read('locale/en.json'))
  const zh = JSON.parse(read('locale/zh.json'))
  assert.ok(en.meta.title && en.meta.description)
  assert.ok(zh.meta.title && zh.meta.description)
})

/* ---------------------------------------------------------------- *
 * Token coverage
 * ---------------------------------------------------------------- */

check(`all ${snapshot.aliases.length} alias tokens are overridden`, () => {
  const missing = snapshot.aliases.filter((name) => !css.includes(name + ':'))
  assert.deepEqual(missing, [])
})

check(`all ${snapshot.statics.length} static dark tokens are mirrored`, () => {
  const missing = snapshot.statics.filter((name) => !css.includes(name + ':'))
  assert.deepEqual(missing, [])
})

check(`all ${snapshot.extras.length} extra theme tokens are overridden`, () => {
  const missing = snapshot.extras.filter((name) => !css.includes(name + ':'))
  assert.deepEqual(missing, [])
})

check('dark document scheme, selection, focus, and motion guards are present', () => {
  for (const needle of [
    'color-scheme: dark !important',
    'html[data-dsh-miku] ::selection',
    '--dsw-focus-ring-color',
    '@media (prefers-reduced-motion: reduce)',
    '@media (forced-colors: active)',
    'pointer-events: none !important',
    '--shiki-token-keyword',
    '--dsw-elevation-stroke-color',
  ]) {
    assert.ok(css.includes(needle), `missing: ${needle}`)
  }
})

/* ---------------------------------------------------------------- *
 * No images / no network
 * ---------------------------------------------------------------- */

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.bmp', '.ico', '.svg'])

function walk(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) files.push(...walk(full))
    else files.push(full)
  }
  return files
}

check('runtime carries no image files', () => {
  const runtimeDirs = ['src', 'lib', 'locale']
  const files = runtimeDirs.flatMap((dir) => walk(join(root, dir)))
  const offenders = files.filter((file) => IMAGE_EXT.has(extname(file).toLowerCase()))
  assert.deepEqual(offenders.map((file) => relative(root, file)), [])
})

check('README preview is documentation-only and referenced', () => {
  const preview = readFileSync(join(root, 'docs/preview.png'))
  assert.ok(preview.length > 0, 'docs/preview.png is empty')
  assert.deepEqual([...preview.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  assert.ok(read('README.md').includes('docs/preview.png'), 'README does not reference docs/preview.png')
  assert.ok((pkg.files ?? []).includes('docs'), 'package.json files does not include docs')
})

check('no image references or remote asset requests', () => {
  for (const [label, text] of [
    ['styles.css', css],
    ['client.js', clientSource],
    ['bundle', bundle],
    ['preview', read('dev/preview.html')],
  ]) {
    assert.ok(!/data:image/i.test(text), `${label} contains data:image`)
    assert.ok(!/<img\b/i.test(text), `${label} contains an img element`)
    assert.ok(!/\burl\(/i.test(text), `${label} contains url()`)
    assert.ok(!/https?:\/\//i.test(text), `${label} contains a remote URL`)
  }
})

/* ---------------------------------------------------------------- *
 * Mock runtime: execute the served bundle
 * ---------------------------------------------------------------- */

function fakeElement(tag) {
  return {
    tagName: tag.toUpperCase(),
    dataset: {},
    attributes: {},
    children: [],
    textContent: '',
    style: {},
    classList: { add() {}, remove() {} },
    setAttribute(name, value) {
      this.attributes[name] = String(value)
    },
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null
    },
    hasAttribute(name) {
      return Object.prototype.hasOwnProperty.call(this.attributes, name)
    },
    removeAttribute(name) {
      delete this.attributes[name]
    },
    appendChild(child) {
      this.children.push(child)
      return child
    },
    append(child) {
      this.children.push(child)
    },
    remove() {
      this.removed = true
    },
    addEventListener() {},
    removeEventListener() {},
  }
}

const documentElement = fakeElement('html')
const body = fakeElement('body')
const head = fakeElement('head')
const document = {
  documentElement,
  body,
  head,
  createElement: (tag) => fakeElement(tag),
  createTextNode: (text) => ({ textContent: text }),
  querySelector(selector) {
    const match = /^style\[data-plugin-css="(.*)"\]$/.exec(selector)
    if (match === null) return null
    return head.children.find((node) => node.dataset && node.dataset.pluginCss === match[1]) ?? null
  },
}

const React = {
  createElement(type, props, ...children) {
    return { type, props: props ?? {}, children }
  },
  Fragment: 'Fragment',
}

const registrations = []
const effects = []
const ctx = {
  effect(callback, label) {
    const cleanup = callback()
    effects.push({ label, cleanup })
    return () => {}
  },
  slots: {
    inject(_name, callback) {
      callback()
      return () => {}
    },
    register(options, component) {
      registrations.push({ options, component })
      return () => {}
    },
  },
}

const requireShim = (specifier) => {
  if (specifier === 'react') return React
  if (specifier === 'react/jsx-runtime') return { jsx: React.createElement, jsxs: React.createElement }
  throw new Error(`unexpected require: ${specifier}`)
}

let captured
const sandbox = {
  window: { __ModuleLoader__: { load(definition) { captured = definition } } },
  document,
  console,
}
vm.runInNewContext(bundle, sandbox, { filename: 'lib/client.js' })
assert.ok(captured, 'bundle did not register with __ModuleLoader__')
const client = captured.factory(requireShim)

function flatten(node, out = []) {
  out.push(node)
  if (node && Array.isArray(node.children)) for (const child of node.children) flatten(child, out)
  return out
}

function textOf(node) {
  if (node === null || node === undefined) return ''
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (node.children) return node.children.map(textOf).join('')
  return ''
}

function registrationsFor(name) {
  return registrations.filter((entry) => entry.options.name === name)
}

check('bundle registers the package id and exports apply/inject', () => {
  assert.equal(captured.id, 'dsh-plugin-miku-skin')
  assert.equal(typeof client.apply, 'function')
  assert.equal(JSON.stringify(client.inject), JSON.stringify(['slots']))
})

check('apply installs the owned stylesheet and marks the document root', () => {
  client.apply(ctx)
  const style = head.children.find((node) => node.dataset && node.dataset.plugin === 'dsh-plugin-miku-skin')
  assert.ok(style, 'no plugin style tag')
  assert.equal(style.dataset.pluginCss, 'dsh-plugin-miku-skin/miku.css')
  assert.ok(style.textContent.includes('--dsw-alias-brand-primary'))
  assert.equal(documentElement.getAttribute('data-dsh-miku'), '')
})

check('all four slot occupants register with the expected shape', () => {
  assert.equal(registrationsFor('sidebar.brand.mark').length, 1)
  assert.equal(registrationsFor('sidebar.brand.name').length, 1)
  assert.equal(registrationsFor('conversation.hero.brand.mark').length, 1)
  const overlay = registrationsFor('shell.overlay')
  assert.equal(overlay.length, 1)
  assert.equal(overlay[0].options.id, 'miku-ambient')
  assert.equal(overlay[0].options.order, -100)
})

check('brand mark renders geometry, the 01 numerals, and host classes', () => {
  const component = registrationsFor('sidebar.brand.mark')[0].component
  const tree = flatten(component({ size: 24, className: 'fish' }))
  const svg = tree.find((node) => node && node.type === 'svg')
  assert.ok(svg, 'no svg in mark')
  assert.ok(tree.filter((node) => node && node.type === 'path').length >= 5)
  assert.ok(tree.filter((node) => node && node.type === 'circle').length >= 2)
  assert.ok(textOf(tree[0]).includes('01'))
  assert.ok(String(tree[0].props.className).includes('dsh-miku-mark'))
  assert.ok(String(tree[0].props.className).includes('fish'))
  assert.equal(tree[0].props.style['--dsh-miku-size'], '24px')

  const hero = flatten(component({ size: 34 }))
  assert.equal(hero[0].props.style['--dsh-miku-size'], '34px')
})

check('wordmark carries MIKU, 01, and a musical note', () => {
  const component = registrationsFor('sidebar.brand.name')[0].component
  const rootNode = component({})
  const text = textOf(rootNode)
  assert.ok(text.includes('MIKU'))
  assert.ok(text.includes('01'))
  assert.ok(text.includes('♪'))
  assert.ok(String(rootNode.props.className).includes('dsh-miku-wordmark'))
})

check('ambient layer is aria-hidden, click-through, and glyph-rich', () => {
  const component = registrationsFor('shell.overlay')[0].component
  const rootNode = component({})
  assert.equal(rootNode.props['aria-hidden'], 'true')
  assert.ok(String(rootNode.props.className).includes('dsh-miku-ambient'))
  const nodes = flatten(rootNode)
  assert.equal(nodes.filter((node) => node && node.type === 'span' && /dsh-miku-note/.test(node.props.className ?? '')).length, 4)
  assert.equal(nodes.filter((node) => node && node.type === 'span' && /dsh-miku-eq-bar/.test(node.props.className ?? '')).length, 9)
  const text = textOf(rootNode)
  for (const glyph of ['♪', '♫', '♬', '♩', '初音未来', '39']) assert.ok(text.includes(glyph), `missing glyph ${glyph}`)
  assert.ok(css.includes('pointer-events: none !important'))
})

check('the document marker is released by its effect cleanup', () => {
  const marker = effects.find((entry) => entry.label === 'miku-skin: document marker')
  assert.ok(marker && typeof marker.cleanup === 'function')
  marker.cleanup()
  assert.equal(documentElement.hasAttribute('data-dsh-miku'), false)
})

/* ---------------------------------------------------------------- *
 * Contrast
 * ---------------------------------------------------------------- */

function parseHex(value) {
  const hex = value.replace('#', '')
  const expand = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex
  const rgb = expand.slice(0, 6)
  return [0, 2, 4].map((offset) => Number.parseInt(rgb.slice(offset, offset + 2), 16) / 255)
}

function luminance(value) {
  const channels = parseHex(value).map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function contrast(foreground, background) {
  const a = luminance(foreground)
  const b = luminance(background)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

check('background and dividers align with codex-miku-skin; overall glow removed; patterns kept', () => {
  for (const needle of [
    '--mku-void: #10171b;',
    '--mku-void-2: #121c21;',
    '--mku-panel-1: #172126;',
    '--mku-panel-2: #1c2a30;',
    '--mku-panel-3: #243b42;',
    '--mku-code: #141d22;',
    '--mku-line-1: #24353c;',
    '--mku-line-2: #30444b;',
    '--mku-line-3: #30444b;',
    '--mku-line-4: #45616a;',
  ]) {
    assert.ok(css.includes(needle), `missing reference palette value: ${needle}`)
  }
  for (const [label, text] of [
    ['styles.css', css],
    ['client.js', clientSource],
    ['preview', read('dev/preview.html')],
  ]) {
    assert.ok(!text.includes('dsh-miku-glow'), `${label} still contains the removed overall glow`)
    assert.ok(!text.includes('dsh-miku-breathe'), `${label} still contains the removed glow animation`)
  }
  for (const pattern of ['dsh-miku-scanlines', 'dsh-miku-grid', 'dsh-miku-ribbons', 'dsh-miku-hud', 'dsh-miku-notes', 'dsh-miku-eq']) {
    assert.ok(css.includes('.' + pattern), `missing retained pattern: ${pattern}`)
  }
})

check('core text and state colors meet WCAG AA', () => {
  const pairs = [
    ['#ecfffc', '#10171b', 7, 'primary text'],
    ['#a9cfcb', '#172126', 4.5, 'secondary text'],
    ['#7fa6a4', '#172126', 4.5, 'tertiary text'],
    ['#041318', '#39c5bb', 4.5, 'label on accent'],
    ['#6ff7ec', '#10171b', 7, 'link on base'],
    ['#ff7a7a', '#1c2a30', 4.5, 'error'],
    ['#4ee0a8', '#1c2a30', 4.5, 'success'],
    ['#f7ad31', '#1c2a30', 4.5, 'warning'],
    ['#ff6fb5', '#10171b', 4.5, 'pink accent'],
  ]
  const results = pairs.map(([fg, bg, minimum, label]) => ({ label, ratio: contrast(fg, bg), minimum }))
  const failures = results.filter((entry) => entry.ratio < entry.minimum)
  assert.deepEqual(failures, [])
  for (const entry of results) console.log(`       ${entry.label}: ${entry.ratio.toFixed(2)}:1 (>= ${entry.minimum})`)
})

console.log(`\n${passed} checks passed.`)
