/* Carnet de vol — Service Worker v6 : hors ligne d'abord, mises à jour en arrière-plan */
var CACHE = "carnet-vol-v6";
var ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-192-maskable.png", "./icon-512-maskable.png"];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(ASSETS.map(function(u){ return c.add(u).catch(function(){}); }));
  }));
  self.skipWaiting();
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var req=e.request;
  if(req.method!=="GET" || req.url.indexOf(self.location.origin)!==0) return;
  e.respondWith(
    caches.match(req,{ignoreSearch:true}).then(function(cached){
      var net=fetch(req).then(function(r){
        if(r && r.status===200 && r.type==="basic"){
          var c=r.clone(); caches.open(CACHE).then(function(cache){ cache.put(req,c); });
        }
        return r;
      }).catch(function(){ return null; });
      if(cached){ e.waitUntil(net); return cached; }
      return net.then(function(r){ return r || caches.match("./index.html") || caches.match("./"); });
    })
  );
});
