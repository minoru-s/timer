// ⚠️ コード（index.htmlなど）を更新した際は、ここの VERSION の文字列（時刻など）を変更してください。
// sw.js 自体のファイル内容が変更されることで、ブラウザが新しいバージョンと認識し、自動で更新・リロードが走ります。
const VERSION = '2026-05-30T13:05:00';
const CACHE_NAME = 'timer-cache-' + VERSION;

const urlsToCache = [
  './',
  './index.html',
  './icon/icon-192.png',
  './icon/icon-512.png'
];

self.addEventListener('install', (event) => {
  // 新しいサービスワーカーがインストールされたら直ちに待機状態をスキップする
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  // 古いキャッシュを削除する
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 新しいサービスワーカーが直ちにすべてのクライアントを制御する
  self.clients.claim();
});

// ネットワークファースト（Network-First）戦略
// オンライン時は常にネットワークから最新リソースを取得してキャッシュを更新し、
// オフライン時はキャッシュから返すことで、コード更新時にすぐ反映されるようにする
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 有効なレスポンスであればキャッシュを更新
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // ネットワークが失敗した場合（オフラインなど）はキャッシュから探す
        return caches.match(event.request);
      })
  );
});
