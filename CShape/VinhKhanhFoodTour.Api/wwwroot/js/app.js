/**
 * App Main - Logic chính của ứng dụng thuyết minh
 * Kết nối Map, Geofence, Audio, QR Scanner
 */

// Session ID ẩn danh
window.APP_SESSION_ID = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

// State
const AppState = {
    language: 'vi',
    pois: [],
    selectedPoi: null,
    isGpsActive: false
};

// Managers
let mapManager, geofenceManager, audioManager, qrScanner, offlineDB;

// UI text đa ngôn ngữ
const UI_TEXT = {
    vi: {
        gpsSearching: 'Đang lấy vị trí GPS...',
        gpsActive: 'GPS đang hoạt động',
        gpsError: 'Lỗi GPS',
        accuracy: 'Độ chính xác',
        listen: 'Nghe thuyết minh',
        navigate: 'Chỉ đường',
        close: 'Đóng',
        nearPoi: 'Bạn đang ở gần',
        tapToListen: 'Nhấn để nghe thuyết minh',
        loading: 'Đang tải dữ liệu...',
        poiList: 'Điểm thuyết minh',
        all: 'Tất cả',
        scanQr: 'Quét QR Code',
        qrInstruction: 'Hướng camera vào mã QR tại điểm dừng'
    },
    en: {
        gpsSearching: 'Getting GPS location...',
        gpsActive: 'GPS is active',
        gpsError: 'GPS Error',
        accuracy: 'Accuracy',
        listen: 'Listen to guide',
        navigate: 'Navigate',
        close: 'Close',
        nearPoi: 'You are near',
        tapToListen: 'Tap to listen to the guide',
        loading: 'Loading data...',
        poiList: 'Points of Interest',
        all: 'All',
        scanQr: 'Scan QR Code',
        qrInstruction: 'Point camera at QR code at bus stop'
    },
    ja: {
        gpsSearching: 'GPS位置を取得中...',
        gpsActive: 'GPS動作中',
        gpsError: 'GPSエラー',
        accuracy: '精度',
        listen: 'ガイドを聞く',
        navigate: 'ナビゲート',
        close: '閉じる',
        nearPoi: '近くにいます',
        tapToListen: 'タップしてガイドを聞く',
        loading: 'データを読み込み中...',
        poiList: 'スポット一覧',
        all: 'すべて',
        scanQr: 'QRコードスキャン',
        qrInstruction: 'バス停のQRコードにカメラを向けてください'
    },
    zh: {
        gpsSearching: '正在获取GPS位置...',
        gpsActive: 'GPS正在运行',
        gpsError: 'GPS错误',
        accuracy: '精度',
        listen: '听语音导览',
        navigate: '导航',
        close: '关闭',
        nearPoi: '您在附近',
        tapToListen: '点击收听语音导览',
        loading: '正在加载数据...',
        poiList: '兴趣点',
        all: '全部',
        scanQr: '扫描二维码',
        qrInstruction: '将摄像头对准公交站的二维码'
    }
};

function t(key) {
    return (UI_TEXT[AppState.language] || UI_TEXT.vi)[key] || key;
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', async () => {
    // Dừng audio cũ nếu trang được reload
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    // Init managers
    audioManager = new AudioManager();
    mapManager = new MapManager('map');
    geofenceManager = new GeofenceManager();
    qrScanner = new QRScannerManager();
    offlineDB = new OfflineDB();

    // Init Offline DB
    await offlineDB.init().catch(e => console.warn('OfflineDB init failed', e));

    // Monitor online/offline status
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();

    // Wire up callbacks
    setupAudioCallbacks();
    setupGeofenceCallbacks();
    setupQRCallbacks();
    setupUIEvents();

    // Init map
    mapManager.init();
    mapManager.onPoiClick = (poi) => showPoiDetail(poi);

    // Load POI data
    await loadPois();

    // Start GPS tracking
    geofenceManager.startTracking();

    // Hide splash screen
    setTimeout(() => {
        document.getElementById('splash-screen').classList.add('fade-out');
        document.getElementById('app').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('splash-screen').style.display = 'none';
            mapManager.map.invalidateSize();
        }, 600);
    }, 1500);

    // Dừng audio khi rời trang hoặc reload
    window.addEventListener('beforeunload', () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    });
});

// ==================== DATA LOADING ====================

async function loadPois() {
    try {
        updateSplashStatus(t('loading'));
        
        let pois = [];
        let isOffline = !navigator.onLine;

        // Try fetch API if online
        if (!isOffline) {
            try {
                const response = await fetch('/api/poi', { signal: AbortSignal.timeout(5000) });
                if (response.ok) {
                    pois = await response.json();
                    
                    // Normalize id field
                    pois = pois.map(p => ({ ...p, id: p.id || p._id }));
                    
                    // Save to IndexedDB for offline
                    await offlineDB.savePois(pois);
                } else {
                    throw new Error('API failed');
                }
            } catch (err) {
                console.warn('Network error, trying offline cache...', err);
                isOffline = true;
            }
        }

        // If offline or fetch failed, load from cache
        if (isOffline) {
            updateSplashStatus('Đang tải dữ liệu offline...');
            const cachedPois = await offlineDB.loadPois();
            if (cachedPois && cachedPois.length > 0) {
                pois = cachedPois;
            } else {
                throw new Error('No offline data available');
            }
        }

        AppState.pois = pois;

        // Add POIs to map
        mapManager.addPois(pois, AppState.language);

        // Setup geofence
        geofenceManager.setPois(pois);

        // Render POI list
        renderPoiList(pois);

        console.log(`✅ Loaded ${pois.length} POIs ${isOffline ? '(Offline)' : ''}`);
    } catch (error) {
        console.error('❌ Error loading POIs:', error);
        updateSplashStatus('Lỗi kết nối. Đang thử lại...');
        // Retry after 3s
        setTimeout(loadPois, 3000);
    }
}

function updateNetworkStatus() {
    const banner = document.getElementById('offline-banner');
    if (!banner) return;
    
    if (!navigator.onLine) {
        banner.classList.remove('hidden');
        console.log('📶 App is offline');
    } else {
        banner.classList.add('hidden');
        console.log('📶 App is online');
    }
}

function updateSplashStatus(text) {
    const el = document.getElementById('splash-status');
    if (el) el.textContent = text;
}

// ==================== GEOFENCE CALLBACKS ====================

function setupGeofenceCallbacks() {
    geofenceManager.onLocationUpdate = (lat, lng, accuracy) => {
        mapManager.updateUserLocation(lat, lng, accuracy);
        
        // Update GPS status bar
        const gpsBar = document.getElementById('gps-status');
        const gpsText = document.getElementById('gps-text');
        const gpsAccuracy = document.getElementById('gps-accuracy');
        
        gpsBar.classList.add('active');
        gpsText.textContent = t('gpsActive');
        gpsAccuracy.textContent = `${t('accuracy')}: ±${Math.round(accuracy)}m`;
        AppState.isGpsActive = true;
    };

    geofenceManager.onPoiEnter = (poi, distance) => {
        console.log(`📍 Entered POI: ${poi.name.vi} (${Math.round(distance)}m)`);
        
        // Tìm full POI data
        const fullPoi = AppState.pois.find(p => p.id === poi.id);
        if (!fullPoi) return;

        const lang = AppState.language;
        const name = fullPoi.name[lang] || fullPoi.name.vi;
        const script = fullPoi.ttsScript[lang] || fullPoi.ttsScript.vi;

        // Show toast notification
        showGeofenceToast(name, fullPoi);

        // Auto-play TTS
        audioManager.enqueue(poi.id, script, name, poi.priority);

        // Track analytics
        fetch('/api/analytics/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventType: 'poi_enter',
                poiId: poi.id,
                sessionId: window.APP_SESSION_ID,
                latitude: geofenceManager.currentPosition?.lat,
                longitude: geofenceManager.currentPosition?.lng
            })
        }).catch(() => {});
    };

    geofenceManager.onClosestPoi = (poi, distance) => {
        mapManager.highlightClosest(poi.id);
        
        // Update distance trong POI list
        updatePoiDistances();
    };

    geofenceManager.onStatusChange = (status) => {
        const gpsBar = document.getElementById('gps-status');
        const gpsText = document.getElementById('gps-text');
        const icon = gpsBar.querySelector('.gps-icon');

        if (status === 'error') {
            gpsBar.classList.remove('active');
            gpsText.textContent = t('gpsError');
            icon.textContent = 'gps_off';
        }
    };

    geofenceManager.onError = (message) => {
        const gpsText = document.getElementById('gps-text');
        gpsText.textContent = message;
    };
}

// ==================== AUDIO CALLBACKS ====================

function setupAudioCallbacks() {
    audioManager.onStateChange = (state) => {
        const playerBar = document.getElementById('audio-player');
        const playBtn = document.getElementById('btn-audio-play');
        const titleEl = document.getElementById('audio-title');
        const waveEl = document.querySelector('.audio-wave');
        const fabStop = document.getElementById('btn-fab-stop');

        if (state.isPlaying || state.isPaused) {
            playerBar.classList.remove('hidden');
            fabStop.classList.remove('hidden');
            titleEl.textContent = state.currentItem?.title || '';
            
            if (state.isPaused) {
                playBtn.querySelector('.material-icons-round').textContent = 'play_arrow';
                waveEl?.classList.add('paused');
            } else {
                playBtn.querySelector('.material-icons-round').textContent = 'pause';
                waveEl?.classList.remove('paused');
            }
        } else {
            playerBar.classList.add('hidden');
            fabStop.classList.add('hidden');
        }
    };
}

// ==================== QR CALLBACKS ====================

function setupQRCallbacks() {
    qrScanner.onQRDetected = async (qrCode) => {
        closeQRModal();

        try {
            // Tìm POI bằng QR Code
            const response = await fetch(`/api/poi/qr/${encodeURIComponent(qrCode)}`);
            if (!response.ok) {
                alert('Không tìm thấy điểm thuyết minh cho QR này');
                return;
            }

            const poi = await response.json();
            poi.id = poi.id || poi._id;
            
            // Show detail và phát audio
            showPoiDetail(poi);
            
            const lang = AppState.language;
            const name = poi.name[lang] || poi.name.vi;
            const script = poi.ttsScript[lang] || poi.ttsScript.vi;
            audioManager.playDirect(poi.id, script, name);
        } catch (e) {
            console.error('QR lookup error:', e);
        }
    };
}

// ==================== UI EVENTS ====================

function setupUIEvents() {
    // Language selector
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            changeLanguage(btn.dataset.lang);
        });
    });

    // Menu button - toggle POI list
    document.getElementById('btn-menu').addEventListener('click', togglePoiPanel);
    document.getElementById('btn-toggle-list').addEventListener('click', togglePoiPanel);
    document.getElementById('btn-close-panel').addEventListener('click', () => {
        document.getElementById('poi-panel').classList.add('hidden');
    });

    // QR Scanner
    document.getElementById('btn-qr').addEventListener('click', openQRModal);
    document.getElementById('btn-close-qr').addEventListener('click', closeQRModal);
    document.getElementById('qr-backdrop').addEventListener('click', closeQRModal);

    // My Location
    document.getElementById('btn-my-location').addEventListener('click', () => {
        mapManager.centerOnUser();
    });

    // Audio controls
    document.getElementById('btn-audio-play').addEventListener('click', () => {
        audioManager.togglePlayPause();
    });
    document.getElementById('btn-audio-stop').addEventListener('click', () => {
        audioManager.stop();
    });

    // FAB Stop button - nút dừng nổi bật trên bản đồ
    document.getElementById('btn-fab-stop').addEventListener('click', () => {
        audioManager.stop();
        audioManager.queue = []; // Xóa luôn hàng chờ
    });

    // POI Detail buttons
    document.getElementById('btn-listen').addEventListener('click', () => {
        if (AppState.selectedPoi) {
            const lang = AppState.language;
            const poi = AppState.selectedPoi;
            const name = poi.name[lang] || poi.name.vi;
            const script = poi.ttsScript[lang] || poi.ttsScript.vi;
            audioManager.playDirect(poi.id, script, name);
        }
    });

    document.getElementById('btn-navigate').addEventListener('click', () => {
        if (AppState.selectedPoi) {
            const { latitude, longitude } = AppState.selectedPoi;
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
        }
    });

    document.getElementById('btn-close-detail').addEventListener('click', closePoiDetail);

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterPois(btn.dataset.filter);
        });
    });

    // Toast listen button
    document.getElementById('toast-listen').addEventListener('click', () => {
        hideGeofenceToast();
    });
}

// ==================== UI FUNCTIONS ====================

function changeLanguage(lang) {
    AppState.language = lang;
    audioManager.setLanguage(lang);
    mapManager.updateLanguage(AppState.pois, lang);
    renderPoiList(AppState.pois);
    
    // Update UI text
    document.getElementById('gps-text').textContent = AppState.isGpsActive ? t('gpsActive') : t('gpsSearching');
    document.getElementById('btn-listen').innerHTML = `<span class="material-icons-round">volume_up</span> ${t('listen')}`;
    document.getElementById('btn-navigate').innerHTML = `<span class="material-icons-round">directions</span> ${t('navigate')}`;
    document.getElementById('btn-close-detail').innerHTML = `<span class="material-icons-round">close</span> ${t('close')}`;
    
    // Update detail if open
    if (AppState.selectedPoi) {
        showPoiDetail(AppState.selectedPoi);
    }
}

function renderPoiList(pois, filter = 'all') {
    const listEl = document.getElementById('poi-list');
    const lang = AppState.language;
    const emoji = { 'seafood': '🦐', 'hotpot': '🍲', 'snack': '🧁', 'street_food': '🍜', 'landmark': '🏛️' };

    const filtered = filter === 'all' ? pois : pois.filter(p => p.category === filter);

    listEl.innerHTML = filtered.map(poi => {
        const name = poi.name[lang] || poi.name.vi || '';
        const desc = poi.description[lang] || poi.description.vi || '';
        const icon = emoji[poi.category] || '📍';
        const distance = geofenceManager.getDistanceTo(poi.latitude, poi.longitude);
        const distText = GeofenceManager.formatDistance(distance);

        return `
            <div class="poi-item" data-poi-id="${poi.id}" onclick="onPoiItemClick('${poi.id}')">
                <div class="poi-item-icon ${poi.category}">${icon}</div>
                <div class="poi-item-info">
                    <div class="poi-item-name">${name}</div>
                    <div class="poi-item-desc">${desc}</div>
                    <div class="poi-item-distance">📍 ${distText}</div>
                </div>
            </div>
        `;
    }).join('');
}

function onPoiItemClick(poiId) {
    const poi = AppState.pois.find(p => p.id === poiId);
    if (poi) {
        showPoiDetail(poi);
        mapManager.centerOnPoi(poiId);
        // Close panel on mobile
        if (window.innerWidth <= 768) {
            document.getElementById('poi-panel').classList.add('hidden');
        }
    }
}

function showPoiDetail(poi) {
    AppState.selectedPoi = poi;
    const lang = AppState.language;
    const categoryNames = {
        'seafood': { vi: 'Hải sản', en: 'Seafood', ja: 'シーフード', zh: '海鲜' },
        'hotpot': { vi: 'Lẩu', en: 'Hotpot', ja: '鍋', zh: '火锅' },
        'snack': { vi: 'Ăn vặt', en: 'Snack', ja: 'スナック', zh: '小吃' },
        'street_food': { vi: 'Đường phố', en: 'Street Food', ja: 'ストリートフード', zh: '街头美食' },
        'landmark': { vi: 'Địa danh', en: 'Landmark', ja: 'ランドマーク', zh: '地标' }
    };

    const catEl = document.getElementById('detail-category');
    catEl.textContent = categoryNames[poi.category]?.[lang] || poi.category;
    catEl.className = `poi-detail-category ${poi.category}`;

    document.getElementById('detail-name').textContent = poi.name[lang] || poi.name.vi;
    document.getElementById('detail-address').textContent = poi.address || '';
    document.getElementById('detail-description').textContent = poi.description[lang] || poi.description.vi;
    document.getElementById('detail-hours-text').textContent = poi.openingHours || '—';
    document.getElementById('detail-price-text').textContent = poi.priceRange || '—';

    const distance = geofenceManager.getDistanceTo(poi.latitude, poi.longitude);
    document.getElementById('detail-distance-text').textContent = GeofenceManager.formatDistance(distance);

    document.getElementById('poi-detail').classList.remove('hidden');
    mapManager.setActiveMarker(poi.id);
}

function closePoiDetail() {
    document.getElementById('poi-detail').classList.add('hidden');
    AppState.selectedPoi = null;
    mapManager.setActiveMarker(null);
}

function togglePoiPanel() {
    const panel = document.getElementById('poi-panel');
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
        updatePoiDistances();
    }
}

function filterPois(category) {
    renderPoiList(AppState.pois, category);
}

function updatePoiDistances() {
    if (!geofenceManager.currentPosition) return;
    document.querySelectorAll('.poi-item').forEach(el => {
        const poiId = el.dataset.poiId;
        const poi = AppState.pois.find(p => p.id === poiId);
        if (poi) {
            const dist = geofenceManager.getDistanceTo(poi.latitude, poi.longitude);
            const distEl = el.querySelector('.poi-item-distance');
            if (distEl) distEl.textContent = '📍 ' + GeofenceManager.formatDistance(dist);
        }
    });
}

function showGeofenceToast(poiName, poi) {
    const toast = document.getElementById('geofence-toast');
    const title = document.getElementById('toast-title');
    const message = document.getElementById('toast-message');

    title.textContent = `${t('nearPoi')}: ${poiName}`;
    message.textContent = t('tapToListen');
    
    toast.classList.remove('hidden');
    toast.classList.remove('fade-out');

    // Auto hide after 8s
    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(hideGeofenceToast, 8000);
}

function hideGeofenceToast() {
    const toast = document.getElementById('geofence-toast');
    toast.classList.add('fade-out');
    setTimeout(() => toast.classList.add('hidden'), 300);
}

function openQRModal() {
    document.getElementById('qr-modal').classList.remove('hidden');
    qrScanner.start('qr-reader');
}

function closeQRModal() {
    qrScanner.stop();
    document.getElementById('qr-modal').classList.add('hidden');
}
