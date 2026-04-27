/**
 * Service Worker - Vĩnh Khánh Food Tour
 * Chiến lược: CacheFirst cho static assets + tiles, NetworkFirst cho API
 * Khi offline → phục vụ từ cache
 */

const CACHE_NAME = 'vinhkhanh-v11';
const API_CACHE = 'vinhkhanh-api-v11';
const TILE_CACHE = 'vinhkhanh-tiles-v11';

// Static assets cần pre-cache
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/admin.html',
    '/css/app.css',
    '/css/admin.css',
    '/js/app.js?v=11',
    '/js/admin.js?v=11',
    '/js/audio-manager.js?v=11',
    '/js/map.js?v=11',
    '/js/geofence.js?v=11',
    '/js/qr-scanner.js?v=11',
    '/js/offline-db.js',
    '/manifest.json'
];

// CDN resources cần cache
const CDN_URLS = [
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
    'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js',
    'https://fonts.googleapis.com/icon?family=Material+Icons+Round',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap'
];

// ==================== INSTALL ====================
self.addEventListener('install', (event) => {
    console.log('🔧 SW: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 SW: Pre-caching app shell');
            return cache.addAll(PRECACHE_ASSETS).catch(err => {
                console.warn('⚠️ SW: Some assets failed to pre-cache:', err);
            });
        })
    );
    self.skipWaiting();
});

// ==================== ACTIVATE ====================
self.addEventListener('activate', (event) => {
    console.log('✅ SW: Activated');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    // Xóa cache cũ
                    if (name !== CACHE_NAME && name !== API_CACHE && name !== TILE_CACHE) {
                        console.log('🗑️ SW: Deleting old cache:', name);
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => {
            // Sau khi active, bắt đầu precache map tiles ngầm
            precacheMapTiles();
        })
    );
    self.clients.claim();
});

// ==================== TILE PRECACHING ====================
function precacheMapTiles() {
    console.log('🗺️ SW: Bắt đầu precache Map Tiles cho Quận 4...');
    const bbox = [106.690, 106.715, 10.745, 10.765]; // minLon, maxLon, minLat, maxLat
    const zoomLevels = [15, 16, 17];
    const urls = [];

    const [minLon, maxLon, minLat, maxLat] = bbox;
    
    zoomLevels.forEach(z => {
        const minX = Math.floor((minLon + 180) / 360 * Math.pow(2, z));
        const maxX = Math.floor((maxLon + 180) / 360 * Math.pow(2, z));
        
        const northLat = maxLat;
        const southLat = minLat;
        const minY = Math.floor((1 - Math.log(Math.tan(northLat * Math.PI / 180) + 1 / Math.cos(northLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
        const maxY = Math.floor((1 - Math.log(Math.tan(southLat * Math.PI / 180) + 1 / Math.cos(southLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
        
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                // Chuẩn hóa url, bỏ qua subdomain a,b,c
                urls.push(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`);
            }
        }
    });

    console.log(`🗺️ SW: Đã tạo ${urls.length} tile URLs cần cache.`);

    caches.open(TILE_CACHE).then(cache => {
        urls.forEach(url => {
            cache.match(url).then(response => {
                if (!response) {
                    // Fetch và cache từng tile (không block luồng chính)
                    fetch(url, { mode: 'cors' })
                        .then(res => {
                            if (res.ok) cache.put(url, res);
                        })
                        .catch(() => {}); // ignore network errors
                }
            });
        });
    });
}

// ==================== FETCH ====================
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Chỉ xử lý GET requests
    if (event.request.method !== 'GET') return;

    // 1. API calls → NetworkFirst
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(event.request, API_CACHE));
        return;
    }

    // 2. Map tiles → CacheFirst (normalized url)
    if (url.hostname.includes('tile.openstreetmap.org')) {
        const cacheUrl = `https://tile.openstreetmap.org${url.pathname}`;
        
        event.respondWith(
            caches.match(cacheUrl).then(cached => {
                if (cached) return cached;
                return fetch(event.request).then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(TILE_CACHE).then(cache => cache.put(cacheUrl, clone));
                    }
                    return response;
                }).catch(() => new Response('Offline', { status: 503 }));
            })
        );
        return;
    }

    // 3. CDN resources (Leaflet, Fonts) → CacheFirst
    if (url.hostname !== location.hostname && 
        (url.hostname.includes('unpkg.com') || 
         url.hostname.includes('googleapis.com') ||
         url.hostname.includes('gstatic.com') ||
         url.hostname.includes('jsdelivr.net'))) {
        event.respondWith(cacheFirst(event.request, CACHE_NAME));
        return;
    }

    // 4. App assets → CacheFirst (đã pre-cache)
    event.respondWith(cacheFirst(event.request, CACHE_NAME));
});

// ==================== STRATEGIES ====================

/**
 * NetworkFirst: Thử mạng trước, nếu lỗi → lấy từ cache
 * Dùng cho API calls
 */
async function networkFirst(request, cacheName) {
    try {
        const response = await fetch(request, { signal: AbortSignal.timeout(8000) });
        // Cache response thành công
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.log('📴 SW: Network failed, serving from cache:', request.url);
        const cached = await caches.match(request);
        if (cached) return cached;
        
        // Trả về empty JSON nếu không có cache
        return new Response(JSON.stringify([]), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * CacheFirst: Lấy từ cache trước, nếu không có → fetch và cache
 * Dùng cho static assets, tiles, CDN
 */
async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.log('📴 SW: Offline, no cache for:', request.url);
        // Nếu là HTML page → trả về cached index
        if (request.headers.get('accept')?.includes('text/html')) {
            const fallback = await caches.match('/index.html');
            if (fallback) return fallback;
        }
        return new Response('Offline', { status: 503 });
    }
}
