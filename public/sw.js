if (!self.define) {
  let e,
    s = {}
  const i = (i, n) => (
    (i = new URL(i + '.js', n).href),
    s[i] ||
      new Promise(s => {
        if ('document' in self) {
          const e = document.createElement('script')
          ;((e.src = i), (e.onload = s), document.head.appendChild(e))
        } else ((e = i), importScripts(i), s())
      }).then(() => {
        let e = s[i]
        if (!e) throw new Error(`Module ${i} didn’t register its module`)
        return e
      })
  )
  self.define = (n, a) => {
    const t =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href
    if (s[t]) return
    let c = {}
    const o = e => i(e, t),
      r = { module: { uri: t }, exports: c, require: o }
    s[t] = Promise.all(n.map(e => r[e] || o(e))).then(e => (a(...e), c))
  }
}
define(['./workbox-4754cb34'], function (e) {
  'use strict'
  ;(importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/_next/app-build-manifest.json',
          revision: '0ac07c897fbe84e4da6706bdbb19f06e',
        },
        {
          url: '/_next/static/BNgv4GlZBhM6ioMqljPzQ/_buildManifest.js',
          revision: 'b4beea8d7631d12d145afced979b8d07',
        },
        {
          url: '/_next/static/BNgv4GlZBhM6ioMqljPzQ/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/34-1202fb77aba71df0.js',
          revision: 'BNgv4GlZBhM6ioMqljPzQ',
        },
        {
          url: '/_next/static/chunks/4bd1b696-f85bb8efa60e5869.js',
          revision: 'BNgv4GlZBhM6ioMqljPzQ',
        },
        {
          url: '/_next/static/chunks/59-d9bd33c82a12dcc2.js',
          revision: 'BNgv4GlZBhM6ioMqljPzQ',
        },
        {
          url: '/_next/static/chunks/684-a6d38266b5918b14.js',
          revision: 'BNgv4GlZBhM6ioMqljPzQ',
        },
        {
          url: '/_next/static/chunks/736-ce003c18d6bd5e14.js',
          revision: 'BNgv4GlZBhM6ioMqljPzQ',
        },
        {
          url: '/_next/static/chunks/885-73027e1b6392c1b9.js',
          revision: 'BNgv4GlZBhM6ioMqljPzQ',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-a793d0a2f9e03fa8.js',
          revision: 'BNgv4GlZBhM6ioMqljPzQ',
        },
        {
          url: '/_next/static/chunks/app/alarms/page-4619deefaf7f988a.js',
          revision: 'BNgv4GlZBhM6ioMqljPzQ',
        },
        {
          url: '/_next/static/chunks/app/energy/page-2a4e54cfdf21734c.js',
          revision: 'BNgv4GlZBhM6ioMqljPzQ',
        },
        {
          url: '/_next/static/chunks/app/history/page-f82deb17dce375ae.js',
          revision: 'BNgv4GlZBhM6ioMqljPzQ',
        },
        {
          url: '/_next/static/chunks/app/layout-5d4c0ad2319c81ba.js',
          revision: 'BNgv4GlZBhM6ioMqljPzQ',
        },
        {
          url: '/_next/static/chunks/app/page-14549590ce83e08c.js',
          revision: 'BNgv4GlZBhM6ioMqljPzQ',
        },
        {
          url: '/_next/static/chunks/app/tracking/page-dad0944a18f9a7f7.js',
          revision: 'BNgv4GlZBhM6ioMqljPzQ',
        },
        {
          url: '/_next/static/chunks/framework-f593a28cde54158e.js',
          revision: 'BNgv4GlZBhM6ioMqljPzQ',
        },
        {
          url: '/_next/static/chunks/main-2cb1995febb83323.js',
          revision: 'BNgv4GlZBhM6ioMqljPzQ',
        },
        {
          url: '/_next/static/chunks/main-app-2b35072f007c273f.js',
          revision: 'BNgv4GlZBhM6ioMqljPzQ',
        },
        {
          url: '/_next/static/chunks/pages/_app-da15c11dea942c36.js',
          revision: 'BNgv4GlZBhM6ioMqljPzQ',
        },
        {
          url: '/_next/static/chunks/pages/_error-cc3f077a18ea1793.js',
          revision: 'BNgv4GlZBhM6ioMqljPzQ',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-f9cb99d5bc5e0bcb.js',
          revision: 'BNgv4GlZBhM6ioMqljPzQ',
        },
        {
          url: '/_next/static/css/e7665a4c931496e5.css',
          revision: 'e7665a4c931496e5',
        },
        {
          url: '/_next/static/media/26a46d62cd723877-s.woff2',
          revision: 'befd9c0fdfa3d8a645d5f95717ed6420',
        },
        {
          url: '/_next/static/media/55c55f0601d81cf3-s.woff2',
          revision: '43828e14271c77b87e3ed582dbff9f74',
        },
        {
          url: '/_next/static/media/581909926a08bbc8-s.woff2',
          revision: 'f0b86e7c24f455280b8df606b89af891',
        },
        {
          url: '/_next/static/media/8e9860b6e62d6359-s.woff2',
          revision: '01ba6c2a184b8cba08b0d57167664d75',
        },
        {
          url: '/_next/static/media/97e0cb1ae144a2a9-s.woff2',
          revision: 'e360c61c5bd8d90639fd4503c829c2dc',
        },
        {
          url: '/_next/static/media/df0a9ae256c0569c-s.woff2',
          revision: 'd54db44de5ccb18886ece2fda72bdfe0',
        },
        {
          url: '/_next/static/media/e4af272ccee01ff0-s.p.woff2',
          revision: '65850a373e258f1c897a2b3d75eb74de',
        },
        { url: '/manifest.json', revision: 'd328821ecb186ad2742776e196c87cb1' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: i,
              state: n,
            }) =>
              s && 'opaqueredirect' === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: s.headers,
                  })
                : s,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1
        const s = e.pathname
        return !s.startsWith('/api/auth/') && !!s.startsWith('/api/')
      },
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1
        return !e.pathname.startsWith('/api/')
      },
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      'GET'
    ))
})
