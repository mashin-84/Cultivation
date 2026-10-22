/* 一念飛仙 離線支援:有網路時一律抓最新版(更新立即生效),沒網路時用上次的快取 */
const CACHE = 'yinian-v2';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const MUSIC = ['dongfu', 'lilian', 'zhandou', 'tianjie', 'wenqing', 'libie', 'weiju'].map(n => './music/' + n + '.webm');
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).then(() => Promise.all(MUSIC.map(u => c.add(u).catch(() => { }))))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  const isMusic = r.url.indexOf('/music/') >= 0;
  /* 音樂:先用快取(檔案大、不常改);其他:先抓網路 */
  if (isMusic) { e.respondWith(caches.match(r, { ignoreSearch: true }).then(m => m || fetch(r).then(res => { if (res && res.ok && res.status === 200) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; }))); return; }
  e.respondWith(fetch(r).then(res => { if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; })
    .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('./index.html'))));
});
