/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'sleep-rhythm-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

let clientPort;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'INIT_PORT') {
    clientPort = event.ports[0];
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action && event.action.startsWith('set-bedtime-')) {
    const bedtime = event.action.replace('set-bedtime-', '');
    if (clientPort) {
        clientPort.postMessage({ type: 'BEDTIME_SELECTED', bedtime: bedtime });
    }
  } else {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});