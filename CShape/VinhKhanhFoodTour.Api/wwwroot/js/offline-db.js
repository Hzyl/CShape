/**
 * Offline DB - Lưu POI data vào IndexedDB để đọc khi mất mạng
 * Đơn giản: lưu toàn bộ POI list, đọc lại khi fetch API lỗi
 */
class OfflineDB {
    constructor() {
        this.dbName = 'VinhKhanhDB';
        this.dbVersion = 1;
        this.db = null;
    }

    /**
     * Mở/tạo database
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Store cho POI data
                if (!db.objectStoreNames.contains('pois')) {
                    db.createObjectStore('pois', { keyPath: 'key' });
                }
                
                // Store cho metadata (thời gian cache, etc.)
                if (!db.objectStoreNames.contains('meta')) {
                    db.createObjectStore('meta', { keyPath: 'key' });
                }
                
                console.log('📦 OfflineDB: Created stores');
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ OfflineDB: Connected');
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error('❌ OfflineDB: Error', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Lưu danh sách POI
     */
    async savePois(pois) {
        if (!this.db) return;
        
        const tx = this.db.transaction(['pois', 'meta'], 'readwrite');
        const poiStore = tx.objectStore('pois');
        const metaStore = tx.objectStore('meta');

        // Lưu từng POI
        for (const poi of pois) {
            const id = poi.id || poi._id;
            await this._put(poiStore, { key: id, data: poi });
        }

        // Lưu metadata
        await this._put(metaStore, { 
            key: 'pois_cache_time', 
            value: Date.now(),
            count: pois.length
        });

        console.log(`💾 OfflineDB: Saved ${pois.length} POIs`);
    }

    /**
     * Đọc danh sách POI từ cache
     */
    async loadPois() {
        if (!this.db) return null;

        const tx = this.db.transaction('pois', 'readonly');
        const store = tx.objectStore('pois');
        
        return new Promise((resolve) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const results = request.result;
                if (results && results.length > 0) {
                    const pois = results.map(r => r.data);
                    console.log(`📂 OfflineDB: Loaded ${pois.length} cached POIs`);
                    resolve(pois);
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => resolve(null);
        });
    }

    /**
     * Kiểm tra có data cached không
     */
    async hasCachedData() {
        if (!this.db) return false;
        
        const tx = this.db.transaction('meta', 'readonly');
        const store = tx.objectStore('meta');
        
        return new Promise((resolve) => {
            const request = store.get('pois_cache_time');
            request.onsuccess = () => {
                if (request.result) {
                    const age = Date.now() - request.result.value;
                    const ageMinutes = Math.round(age / 60000);
                    console.log(`📊 OfflineDB: Cache age = ${ageMinutes} min, ${request.result.count} POIs`);
                    resolve(true);
                } else {
                    resolve(false);
                }
            };
            request.onerror = () => resolve(false);
        });
    }

    /**
     * Helper: put vào store
     */
    _put(store, data) {
        return new Promise((resolve, reject) => {
            const request = store.put(data);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// Export global
window.OfflineDB = OfflineDB;
