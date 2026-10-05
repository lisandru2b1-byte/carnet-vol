/* Carnet de vol — Service Worker v2 */
var CACHE = "carnet-vol-v2";
var ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }));
  self.skipWaiting();
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener("fetch", function(e){
  if(!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    fetch(e.request).then(function(r){
      if(r&&r.status===200&&r.type==="basic"){
        var c=r.clone(); caches.open(CACHE).then(function(cache){cache.put(e.request,c);});
      }
      return r;
    }).catch(function(){
      return caches.match(e.request).then(function(c){ return c||caches.match("./index.html"); });
    })
  );
});
