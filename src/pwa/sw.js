/* 一念飛仙 離線支援
   - index.html 等主檔:有網路時抓最新版(更新立即生效),沒網路用快取
   - 圖片、音樂:先用快取(檔案多且不常改),第一次安裝後在背景把全部圖片存起來,之後離線也完整 */
const CACHE = 'yinian-v3', MEDIA = 'yinian-media-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const MUSIC = ['dongfu', 'lilian', 'zhandou', 'tianjie', 'wenqing', 'libie', 'weiju'].map(n => './music/' + n + '.webm');
async function warm() {
  const c = await caches.open(MEDIA);
  let list = []; try { list = await (await fetch('./assets/list.json', { cache: 'no-store' })).json(); } catch (e) { }
  const want = new Set(MUSIC.concat(list).map(u => new URL(u, self.registration.scope).href));
  for (const k of await c.keys()) if (!want.has(k.url) && list.length) await c.delete(k);   /* 清掉已換掉的舊圖 */
  for (const u of want) { try { if (!(await c.match(u))) await c.add(u); } catch (e) { } }
}
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== MEDIA).map(k => caches.delete(k)))).then(() => self.clients.claim()));
  warm();
});
self.addEventListener('message', e => { if (e.data === 'warm') warm(); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (/\/(assets|music|sfx)\//.test(r.url) && !/list\.json$/.test(r.url)) {
    e.respondWith(caches.open(MEDIA).then(c => c.match(r).then(m => m || fetch(r).then(res => { if (res && res.status === 200) c.put(r, res.clone()); return res; }))));
    return;
  }
  /* 主檔一律向伺服器確認是否有新版(GitHub Pages 預設讓瀏覽器快取 10 分鐘,不加這個會拿到舊版) */
  e.respondWith(fetch(r, { cache: 'no-cache' }).then(res => { if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; })
    .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('./index.html'))));
});
