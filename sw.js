const appPath = location.href.replace('/sw.js','');

const filesToCache = [
    appPath + '/images/',
    appPath + '/index.html',
    appPath + '/clock.js',
    appPath + '/style.css'
];

// Krok 2.1: stworzenie nowego cache’a o nazwie v1
self.addEventListener('install', event => {
    console.log('V1 installing…');
    event.waitUntil(caches.open('v1').then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(filesToCache);
    }));
});
  
//Krok 3: teraz aby móc korzystać z scachowanych zasobów musimy jeszcze zwrócić je do lokalnego cache’a.
//W tym celu dodamy event listenter na zdarzenie fetch.

self.addEventListener('fetch', event => {
    event.respondWith(caches.open('v1').then(cache =>
        cache.match(event.request).then(response => {
            if (response) {
                console.log('[ServiceWorker] loaded from cache: ', event.request.url);
            }
            return response || fetch(event.request).then(response => {
                cache.put(event.request, response.clone());
                console.log('[ServiceWorker] added to cache: ', event.request.url);
                return response;
            })
        })
    )); 
});