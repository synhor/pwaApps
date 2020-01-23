const appPath = location.href.replace('/sw.js','');
const expectedCache = 'appOne_v6';
const useServiceWorker = true;
const serviceWorkerExcludedHosts = [];
 
const filesToCache = [
    appPath + '/init.js',
    appPath + '/index.html',
    appPath + '/clock.js',
    appPath + '/style.css'
];

//Krok 7. IndexedDB
const getProductsUrl = 'http://localhost/pwaServices/getProducts';

self.importScripts('./idb/idb.js');

function createDB() {
    idb.open('products', 1, function(upgradeDB) {
        var store = upgradeDB.createObjectStore('beverages', {
            keyPath: 'id'
        });
        store.put({id: 123, name: 'coke', price: 10.99, quantity: 200});
        store.put({id: 321, name: 'pepsi', price: 8.99, quantity: 100});
        store.put({id: 222, name: 'water', price: 11.99, quantity: 300});
    });
}

if (!useServiceWorker || serviceWorkerExcludedHosts.includes(self.registration.scope)) {
    //Krok 5: Opcjonalne wyłączanie
    self.addEventListener('install', event => {
        console.log('[ServiceWorker] Servise worker will be disabled');
        event.waitUntil(caches.open(expectedCache).then(cache => {
            console.log('[ServiceWorker] Servise worker is disabled');
            return self.registration.unregister();
        }));
    });
} else {
    self.addEventListener('activate', function(event) {
        event.waitUntil(
          createDB()
        );
    });    
    // Krok 2.1: stworzenie nowego cache’a o nazwie v1
    // W tym celu dodamy event listenter na zdarzenie fetch.
    self.addEventListener('install', event => {
        console.log(expectedCache + ' installing…');
        event.waitUntil(caches.open(expectedCache).then(cache => {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        }));
    });
    
    //Krok 3 (deleted): teraz aby móc korzystać z scachowanych zasobów musimy jeszcze zwrócić je do lokalnego cache’a.
    //W tym celu dodamy event listenter na zdarzenie fetch.
    
    //Krok 6: Offline mode v2
    self.addEventListener('fetch', event => {
        if (event.request.url === getProductsUrl) {
            const serviceFailedPromise = idb.open('products', 1).then(function(db) {
                var tx = db.transaction(['beverages'], 'readonly');
                var store = tx.objectStore('beverages');
                return store.getAll();
            }).then(function(items) {                
                return new Response(JSON.stringify({ data: items}));        
            })
            event.respondWith(fetch(event.request).then(response => {
                if (response.status === 404) {
                    console.log('[ServiceWorker] Loading products from indexedDB');                
                    return serviceFailedPromise

                }
                return response;
            }).catch(()=> {
                console.log('[ServiceWorker] Loading products from indexedDB');
                return serviceFailedPromise;
            }));
            return;
        }
        event.respondWith(caches.open(expectedCache).then(cache =>
            cache.match(event.request).then(response => {
                return fetch(event.request).then(response => {
                    cache.put(event.request, response.clone());
                    console.log('[ServiceWorker] added to cache: ', event.request.url);
                    return response;
                }).catch(() => {
                    if (response) {
                        console.log('[ServiceWorker] Network failed. Loaded from cache: ', event.request.url);
                    }
                    return response;
                })
            })
        )); 
    });
}

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