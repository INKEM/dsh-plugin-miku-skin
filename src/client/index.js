/**
 * Miku dark skin — browser half.
 *
 * Source for the served `lib/client.js` bundle. The build script wraps this
 * file in the DSH lazy-CJS `window.__ModuleLoader__.load({ id, factory })`
 * envelope and substitutes the CSS placeholder with the compiled stylesheet,
 * so this file stays readable and can be tested with a small mock runtime.
 *
 * The skin registers four slot occupants:
 *   - sidebar.brand.mark          24px geometric twin-tail mark
 *   - sidebar.brand.name          MIKU / 01 / ♪ wordmark
 *   - conversation.hero.brand.mark  34px mark in the empty conversation hero
 *   - shell.overlay               click-through ambient geometry and glyphs
 *
 * No images, no network requests, no persisted preferences: enabling the
 * bundle is the switch, and every DOM/style change is released on unload.
 */

const React = require('react')

const PLUGIN_ID = 'dsh-plugin-miku-skin'
const CSS_TAG = PLUGIN_ID + '/miku.css'
const ROOT_ATTRIBUTE = 'data-dsh-miku'
const CSS = __MIKU_CSS__

/** Inject the plugin-owned stylesheet once; the module system removes it on unload. */
function installStyle() {
  if (typeof document === 'undefined') return
  if (document.querySelector('style[data-plugin-css=' + JSON.stringify(CSS_TAG) + ']') !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = PLUGIN_ID
  tag.dataset.pluginCss = CSS_TAG
  tag.textContent = CSS
  document.head.appendChild(tag)
}

/**
 * Render the twin-tail mark. Geometry only: two mirrored tail strokes, a dark
 * head circle with a cyan headset arc, a pink microphone dot, and the 01
 * numerals as text over the centre.
 * @param {{ size?: number, className?: string }} props - host slot props.
 * @returns {React.ReactElement} the mark element.
 */
function MikuMark({ size = 24, className }) {
  const px = typeof size === 'number' && Number.isFinite(size) && size > 0 ? size : 24
  const classes = 'dsh-miku-mark' + (className ? ' ' + String(className) : '')
  const tailLeft = 'M12.4 5.2 C7 8.1 4.4 13.2 5.5 19.6 C6.1 23 5.1 26.3 3.9 29.1'
  const tailRight = 'M19.6 5.2 C25 8.1 27.6 13.2 26.5 19.6 C25.9 23 26.9 26.3 28.1 29.1'
  return React.createElement(
    'span',
    {
      className: classes,
      'aria-hidden': 'true',
      style: {
        '--dsh-miku-size': px + 'px',
        width: px + 'px',
        height: px + 'px',
      },
    },
    React.createElement(
      'svg',
      {
        viewBox: '0 0 32 32',
        focusable: 'false',
        'aria-hidden': 'true',
      },
      React.createElement('path', {
        d: tailLeft,
        fill: 'none',
        stroke: '#1e6f70',
        strokeWidth: 3.4,
        strokeLinecap: 'round',
      }),
      React.createElement('path', {
        d: tailRight,
        fill: 'none',
        stroke: '#1e6f70',
        strokeWidth: 3.4,
        strokeLinecap: 'round',
      }),
      React.createElement('path', {
        d: tailLeft,
        fill: 'none',
        stroke: '#6ff7ec',
        strokeWidth: 1.1,
        strokeLinecap: 'round',
        strokeOpacity: 0.85,
      }),
      React.createElement('path', {
        d: tailRight,
        fill: 'none',
        stroke: '#6ff7ec',
        strokeWidth: 1.1,
        strokeLinecap: 'round',
        strokeOpacity: 0.85,
      }),
      React.createElement('circle', {
        cx: 16,
        cy: 15,
        r: 6.2,
        fill: '#0c1216',
        stroke: '#39c5bb',
        strokeWidth: 1.2,
      }),
      React.createElement('path', {
        d: 'M10.1 13.1 C10.7 9.6 13 7.7 16 7.7 C19 7.7 21.3 9.6 21.9 13.1',
        fill: 'none',
        stroke: '#6ff7ec',
        strokeWidth: 0.95,
        strokeLinecap: 'round',
        strokeOpacity: 0.8,
      }),
      React.createElement('circle', {
        cx: 21.9,
        cy: 13.1,
        r: 0.95,
        fill: '#ff6fb5',
      }),
    ),
    React.createElement(
      'span',
      {
        className: 'dsh-miku-mark-01',
        'aria-hidden': 'true',
      },
      '01',
    ),
  )
}

/**
 * Render the sidebar wordmark.
 * @returns {React.ReactElement} the wordmark element.
 */
function MikuBrandName() {
  return React.createElement(
    'span',
    { className: 'dsh-miku-wordmark' },
    React.createElement('span', { className: 'dsh-miku-wordmark-main' }, 'MIKU'),
    React.createElement('span', { className: 'dsh-miku-wordmark-01' }, '01'),
    React.createElement(
      'span',
      { className: 'dsh-miku-wordmark-note', 'aria-hidden': 'true' },
      '♪',
    ),
  )
}

/**
 * Render the edge-anchored ambient layer. Every ornament is geometry, a
 * gradient, or a text glyph; the layer is click-through and hidden from
 * assistive technology.
 * @returns {React.ReactElement} the ambient overlay.
 */
function MikuAmbient() {
  return React.createElement(
    'div',
    { className: 'dsh-miku-ambient', 'aria-hidden': 'true' },
    React.createElement('div', { className: 'dsh-miku-scanlines' }),
    React.createElement('div', { className: 'dsh-miku-grid' }),
    React.createElement(
      'svg',
      {
        className: 'dsh-miku-ribbons',
        viewBox: '0 0 1200 900',
        preserveAspectRatio: 'xMidYMid slice',
        focusable: 'false',
        'aria-hidden': 'true',
      },
      React.createElement('path', {
        d: 'M1090 70 C860 190 780 380 900 560 C970 668 930 780 760 850',
        fill: 'none',
        stroke: '#39c5bb',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeOpacity: 0.9,
      }),
      React.createElement('path', {
        d: 'M1130 40 C900 170 820 360 930 540 C1000 650 980 780 820 860',
        fill: 'none',
        stroke: '#6ff7ec',
        strokeWidth: 1,
        strokeLinecap: 'round',
        strokeOpacity: 0.7,
      }),
      React.createElement('path', {
        d: 'M760 40 C610 190 640 360 790 470 C880 540 860 680 730 760',
        fill: 'none',
        stroke: '#ff6fb5',
        strokeWidth: 1,
        strokeLinecap: 'round',
        strokeOpacity: 0.5,
      }),
    ),
    React.createElement('div', { className: 'dsh-miku-hud' }),
    React.createElement(
      'div',
      { className: 'dsh-miku-notes' },
      React.createElement('span', { className: 'dsh-miku-note dsh-miku-note-1' }, '♪'),
      React.createElement('span', { className: 'dsh-miku-note dsh-miku-note-2' }, '♫'),
      React.createElement('span', { className: 'dsh-miku-note dsh-miku-note-3' }, '♬'),
      React.createElement('span', { className: 'dsh-miku-note dsh-miku-note-4' }, '♩'),
    ),
    React.createElement(
      'div',
      { className: 'dsh-miku-eq' },
      React.createElement('span', { className: 'dsh-miku-eq-bar' }),
      React.createElement('span', { className: 'dsh-miku-eq-bar' }),
      React.createElement('span', { className: 'dsh-miku-eq-bar' }),
      React.createElement('span', { className: 'dsh-miku-eq-bar' }),
      React.createElement('span', { className: 'dsh-miku-eq-bar' }),
      React.createElement('span', { className: 'dsh-miku-eq-bar' }),
      React.createElement('span', { className: 'dsh-miku-eq-bar' }),
      React.createElement('span', { className: 'dsh-miku-eq-bar' }),
      React.createElement('span', { className: 'dsh-miku-eq-bar' }),
    ),
    React.createElement('div', { className: 'dsh-miku-caption' }, '初音未来 / MIKU 39'),
  )
}

/** Services required before the skin can register its slot occupants. */
const inject = ['slots']

/**
 * Install the skin: inject the stylesheet, mark the document root, and fill
 * the four presentation seats. All three are released with the plugin fiber.
 * @param {import('@deepseek-ai/cordis').Context} ctx - client context.
 */
function apply(ctx) {
  if (typeof document === 'undefined') return
  installStyle()

  const root = document.documentElement
  ctx.effect(
    () => {
      root.setAttribute(ROOT_ATTRIBUTE, '')
      return () => {
        root.removeAttribute(ROOT_ATTRIBUTE)
      }
    },
    'miku-skin: document marker',
  )

  ctx.slots.inject('sidebar.brand.mark', () =>
    ctx.slots.register({ name: 'sidebar.brand.mark' }, MikuMark),
  )
  ctx.slots.inject('sidebar.brand.name', () =>
    ctx.slots.register({ name: 'sidebar.brand.name' }, MikuBrandName),
  )
  ctx.slots.inject('conversation.hero.brand.mark', () =>
    ctx.slots.register({ name: 'conversation.hero.brand.mark' }, MikuMark),
  )
  ctx.slots.inject('shell.overlay', () =>
    ctx.slots.register(
      {
        name: 'shell.overlay',
        id: 'miku-ambient',
        order: -100,
        label: () => 'miku-ambient',
      },
      MikuAmbient,
    ),
  )
}

exports.apply = apply
exports.inject = inject
