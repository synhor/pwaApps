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
  