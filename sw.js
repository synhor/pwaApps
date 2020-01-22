const appPath = location.href.replace('/sw.js','');
const expectedCache = 'appOne_v2';

const filesToCache = [
    appPath + '/images/',
    appPath + '/index.html',
    appPath + '/clock.js',
    appPath + '/style.css'
];

// Krok 2.1: stworzenie nowego cache’a o nazwie v1
// W tym celu dodamy event listenter na zdarzenie fetch.
self.addEventListener('install', event => {
    console.log(expectedCache + ' installing…');
    event.waitUntil(caches.open(expectedCache).then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(filesToCache);
    }));
});
  
//Krok 3: teraz aby móc korzystać z scachowanych zasobów musimy jeszcze zwrócić je do lokalnego cache’a.
//W tym celu dodamy event listenter na zdarzenie fetch.

self.addEventListener('fetch', event => {
    event.respondWith(caches.open(expectedCache).then(cache =>
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

//Krok 4: kontrola wersji i odswieżanie
//W tym celu dodamy event listenter na zdarzenie fetch.
self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(keys => 
        Promise.all(keys.map(key => {
            if (expectedCache !== key) {
                console.log('[ServiceWorker] New cache version detected:' + expectedCache);
                console.log('[ServiceWorker] Deleting old cache:' + key);
                return caches.delete(key);
            }
        })
    )).then(() => {
        console.log('[ServiceWorker] Version ' + expectedCache + ' now ready to handle fetches!');
    }));
});