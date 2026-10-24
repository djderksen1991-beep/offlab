/* Analog Service Worker: immer zuerst die neueste Version aus dem Netz holen (ohne Browser-Zwischenspeicher),
   nur ohne Netz die gespeicherte Kopie zeigen. */
const C='analog-v2';
const CORE=['./','./manifest.webmanifest','./icon-192.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(
    fetch(e.request.url,{cache:'no-store',credentials:'same-origin'})
      .then(r=>{if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp))}return r})
      .catch(()=>caches.match(e.request).then(m=>m||caches.match('./')))
  );
});
