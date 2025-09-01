// js/service-worker.js

const CACHE_NAME = 'clt-financeiro-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/assets/css/styles.css',
    '/js/main.js',
    '/js/config.js',
    '/js/modules/router.js',
    '/js/modules/db.js',
    '/js/modules/ui.js',
    '/js/modules/utils.js',
    '/js/modules/calc.js',
    '/js/modules/chart-config.js',
    // Adicionar outros ficheiros JS de views e módulos aqui é uma boa prática
    // para uma experiência offline mais robusta.
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://unpkg.com/lucide-react@latest/dist/umd/lucide.js'
];

// Evento de Instalação: Guarda os assets em cache.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Evento de Ativação: Limpa caches antigos.
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Evento de Fetch: Interceta os pedidos e serve a partir da cache se disponível.
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se o recurso estiver na cache, retorna-o.
                if (response) {
                    return response;
                }
                // Caso contrário, faz o pedido à rede.
                return fetch(event.request);
            })
    );
});