/* Carnet de vol — Service Worker v1 */
var CACHE = "carnet-vol-v1";
var ASSETS = ["./", "./index.html", "./manifest.json"];

/* Installation : mise en cache des assets */
self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
  );
  self.skipWaiting();
});

/* Activation : nettoyage des anciens caches */
self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

/* Fetch : cache d'abord, réseau en fallback */
self.addEventListener("fetch", function(e){
  /* Ne pas intercepter les requêtes externes (PDF.js CDN etc.) */
  if(!e.request.url.startsWith(self.location.origin)){ return; }
  e.respondWith(
    caches.match(e.request).then(function(cached){
      if(cached) return cached;
      return fetch(e.request).then(function(response){
        /* Mettre en cache les nouvelles ressources valides */
        if(response && response.status===200 && response.type==="basic"){
          var clone=response.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        }
        return response;
      }).catch(function(){
        /* Hors ligne et pas en cache : retourner la page principale */
        return caches.match("./index.html");
      });
    })
  );
});
