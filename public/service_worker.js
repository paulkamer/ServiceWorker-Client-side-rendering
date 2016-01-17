importScripts('/javascripts/mustache.js');

var CACHE_NAME = 'dependencies-cache';
var REQUIRED_FILES = [
  '/static/layout_serviceworker.mst',
  '/static/template.mst',
  '/static/partial.js.mst',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[install] Caches opened, adding all core components to cache');
        return cache.addAll(REQUIRED_FILES);
      })
      .then(function() {
        console.log('[install] All required resources have been cached');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  // if requesting main page; render template in SW and return
  if( isRequestForMainPage(event.request) ) {

    console.log('Intercepting initial page request. Rendering HTML locally in ServiceWorker instead...', event.request.url)

    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.match('/static/layout_serviceworker.mst').then(function(layout_response) {
          return layout_response.text().then(function(layout_template) {
            return cache.match('/static/partial.js.mst').then(function(template_response) {
              return template_response.text().then(function(template) {
                var html = Mustache.render(layout_template, { inline_javascript: Mustache.render(template) })
                return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html' } });
              })
            })
          })
        })
      })
    )
  }
  else {
    console.log('requesting something else', event.request.url)
    event.respondWith(getFromCacheOrNetwork(event.request));
  }
});

function isRequestForMainPage(request) {
  return request.url.match(/index_serviceworker.html/);
}


function getFromCacheOrNetwork(request) {
  return self.caches.open(CACHE_NAME).then(function(cache) {
    return cache.match(request).then(function(match) {
      return match || fetch(request).then(function(response) {
         cache.put(request, response.clone());
         return response;
      });
    });
  });
}

