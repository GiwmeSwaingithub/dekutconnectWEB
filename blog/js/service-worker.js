/**
 * DEKUTCONNECT Post — Service Worker
 * Implements cache-first for static assets + network-first for article data.
 * This keeps the site functional offline and drastically reduces Firebase reads
 * (key to staying within the 50K/day Firestore free quota with 1M+ readers).
 */

const CACHE_NAME = 'dekutconnect-v2';
const STATIC_ASSETS = [
  '/blog/',
  '/blog/index.html',
  '/blog/post.html',
  '/blog/css/style.css',
  '/blog/css/uiverse-social.css',
  '/blog/css/uiverse-loader.css',
  '/blog/css/uiverse-rating.css',
  '/blog/css/uiverse-upload.css',
  '/blog/js/cache-manager.js',
  '/blog/js/firebase-config.js',
  '/blog/js/blog-engine.js',
  '/blog/js/post-view.js',
  '/blog/js/legal-compliance.js',
  '/blog/js/instagram-embed.js',
  '/blog/js/admin-editor.js',
  '/blog/fonts/PlayfairDisplay.ttf',
  '/blog/fonts/UnifrakturCook-Bold.ttf',
  '/blog/fonts/UnifrakturMaguntia.ttf',
  '/blog/posts.json',
];

// Install: pre-cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).catch(() => {}) // Don't fail install if some assets aren't available
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - Static assets (CSS/JS/fonts): cache-first
// - API/Firestore calls: network-first
// - HTML pages: network-first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and Firebase/external API calls (let them go to network)
  if (request.method !== 'GET') return;
  if (url.hostname.includes('firebasestorage') ||
      url.hostname.includes('firebaseio') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('gstatic.com') ||
      url.hostname.includes('postimg.cc') ||
      url.hostname.includes('instagram.com')) return;

  // Static assets: cache-first
  if (/\.(css|js|ttf|woff2?|svg|png|jpg|jpeg|webp|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // HTML and data: network-first with offline fallback
  event.respondWith(
    fetch(request).then((res) => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
      }
      return res;
    }).catch(() => {
      return caches.match(request).then(cached => cached || caches.match('/blog/index.html'));
    })
  );
});
