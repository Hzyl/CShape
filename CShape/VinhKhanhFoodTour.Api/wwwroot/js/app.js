/**
 * App Main - Logic chính của ứng dụng thuyết minh
 * Kết nối Map, Geofence, Audio, QR Scanner
 */

// Session ID ẩn danh
window.APP_SESSION_ID = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

// Auth token key
const AUTH_TOKEN_KEY = 'vinhkhanh_token';

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
    // Xóa params rác khỏi URL (nocache, v=...) — không reload, chỉ clean URL bar
    cleanUrlParams(['nocache', 'v']);

    // Dừng audio cũ nếu trang được reload
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    // [TẠM TẮT LOGIN] — Bỏ qua đăng nhập, vào thẳng app
    // const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    // if (!token) {
    //     setupLoginForm();
    //     return;
    // }

    // Ẩn login screen và vào app luôn
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) loginScreen.classList.add('hidden');
    await initApp();
});

/** Xóa các query params không cần thiết khỏi URL bar (không reload trang) */
function cleanUrlParams(removeKeys) {
    const url = new URL(window.location.href);
    let changed = false;
    removeKeys.forEach(k => {
        if (url.searchParams.has(k)) {
            url.searchParams.delete(k);
            changed = true;
        }
    });
    if (changed) {
        window.history.replaceState({}, '', url.pathname + (url.search || '') + (url.hash || ''));
    }
}

/** Hiển thị form đăng nhập và xử lý submit */
function setupLoginForm() {
    const loginScreen = document.getElementById('login-screen');
    const loginForm   = document.getElementById('login-form');
    const loginBtn    = document.getElementById('login-btn');
    const loginError  = document.getElementById('login-error');
    const togglePw    = document.getElementById('toggle-pw');
    const pwInput     = document.getElementById('login-password');
    const pwIcon      = document.getElementById('toggle-pw-icon');

    // Toggle hiện/ẩn mật khẩu
    togglePw.addEventListener('click', () => {
        const isHidden = pwInput.type === 'password';
        pwInput.type = isHidden ? 'text' : 'password';
        pwIcon.textContent = isHidden ? 'visibility' : 'visibility_off';
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.classList.add('hidden');

        const username = document.getElementById('login-username').value.trim();
        const password = pwInput.value;

        if (!username || !password) return;

        // Loading state
        loginBtn.disabled = true;
        loginBtn.classList.add('loading');
        loginBtn.querySelector('.material-icons-round').textContent = 'refresh';
        loginBtn.lastChild.textContent = ' Đang đăng nhập...';

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) throw new Error('Invalid credentials');

            const data = await res.json();
            // Lưu token vào sessionStorage (xóa khi đóng tab)
            sessionStorage.setItem(AUTH_TOKEN_KEY, data.token);
            sessionStorage.setItem('vinhkhanh_user', data.username);

            // Ẩn login screen với animation
            loginScreen.classList.add('hidden');

            // Tiếp tục init app
            await initApp();

        } catch {
            loginError.classList.remove('hidden');
            loginBtn.disabled = false;
            loginBtn.classList.remove('loading');
            loginBtn.querySelector('.material-icons-round').textContent = 'login';
            loginBtn.lastChild.textContent = ' Đăng nhập';
        }
    });
}

/** Khởi tạo toàn bộ app sau khi đăng nhập thành công */
async function initApp() {
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

    // Xử lý URL param ?qr= (khi mở app bằng cách quét QR code)
    handleQrUrlParam();

    // Kéo bottom sheet lên/xuống
    setupBottomSheetDrag();

    // Hiển thị splash
    document.getElementById('splash-screen').classList.remove('hidden');
}



/**
 * Kiểm tra URL param ?qr= khi load trang
 * (trường hợp du khách quét QR bằng camera điện thoại → mở link trong trình duyệt)
 */
function handleQrUrlParam() {
    const params = new URLSearchParams(window.location.search);
    const qrCode = params.get('qr');
    if (qrCode) {
        console.log('📱 QR code from URL param:', qrCode);
        // Đợi 1 chút cho map render xong rồi mới xử lý
        setTimeout(() => handleQrCode(qrCode), 2000);
    }
}


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

// ==================== QR URL HANDLER ====================

/**
 * Xử lý khi mở app bằng cách quét QR Code tại cửa hàng.
 * URL: /index.html?qr=VK-POI-001
 * Tự động tìm POI và phát thuyết minh.
 */
function handleQrUrlParam() {
    const params = new URLSearchParams(window.location.search);
    const qrCode = params.get('qr');
    if (!qrCode) return;

    console.log('📱 Mở app qua QR Code:', qrCode);
    
    // Đợi POI load xong (tối đa 5s)
    const tryFind = (attempt = 0) => {
        const poi = AppState.pois.find(p => 
            (p.qrCode && p.qrCode === qrCode) || p.id === qrCode
        );
        
        if (poi) {
            // Hiển thị chi tiết và phát thế minh ngay
            showPoiDetail(poi);
            mapManager.centerOnPoi(poi.id);
            
            const lang = AppState.language;
            const name = poi.name[lang] || poi.name.vi;
            const script = poi.ttsScript[lang] || poi.ttsScript.vi;
            
            // Phát sau 1 giây (chờ splash screen tắt)
            setTimeout(() => {
                audioManager.playDirect(poi.id, script, name);
                console.log('✅ QR: Đang phát thuyết minh cho', name);
            }, 1800);
        } else if (attempt < 10) {
            // Thử lại sau 500ms nếu POI chưa load
            setTimeout(() => tryFind(attempt + 1), 500);
        } else {
            console.warn('⚠️ Không tìm thấy POI với mã QR:', qrCode);
        }
    };
    
    // Bắt đầu tìm sau khi splash screen bắt đầu tắt (1.5s)
    setTimeout(() => tryFind(), 1500);
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

        // Chỉ phát 1 lần/POI trong session
        if (audioManager.hasPlayed(poi.id)) {
            console.log(`⏭️ POI ${poi.name.vi} đã được thuyết minh trong session này, bỏ qua.`);
            return;
        }

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
        const bottomSheet = document.getElementById('poi-detail');

        if (state.isPlaying || state.isPaused) {
            playerBar.classList.remove('hidden');
            fabStop.classList.remove('hidden');
            titleEl.textContent = state.currentItem?.title || '';
            
            // Đẩy bottom-sheet lên trên khi audio bar xuất hiện (56px = chiều cao audio bar)
            if (bottomSheet && !bottomSheet.classList.contains('hidden')) {
                bottomSheet.style.paddingBottom = '60px';
            }
            
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
            if (bottomSheet) bottomSheet.style.paddingBottom = '';
        }
    };
}

function setupQRCallbacks() {
    qrScanner.onQRDetected = async (rawQrCode) => {
        closeQRModal();
        await handleQrCode(rawQrCode);
    };
}

/**
 * Xử lý mã QR — dùng cả cho QR scanner trong app lẫn QR param từ URL
 */
async function handleQrCode(rawQrCode) {
    // Nếu QR chứa URL (ví dụ: https://host/index.html?qr=VK-POI-001)
    // → trích xuất mã QR thật từ param ?qr=
    let qrCode = rawQrCode;
    try {
        const url = new URL(rawQrCode);
        const qrParam = url.searchParams.get('qr');
        if (qrParam) {
            qrCode = qrParam;
            console.log('📱 Extracted QR code from URL:', qrCode);
        }
    } catch (e) {
        // Không phải URL → dùng nguyên giá trị
    }

    console.log('🔍 Looking up POI for QR:', qrCode);

    // Bước 1: Tìm trong dữ liệu đã load (nhanh, hoạt động offline)
    let poi = AppState.pois.find(p => 
        (p.qrCode && p.qrCode === qrCode) || p.id === qrCode
    );

    // Bước 2: Nếu không tìm thấy local → thử gọi API
    if (!poi) {
        try {
            const response = await fetch(`/api/poi/qr/${encodeURIComponent(qrCode)}`);
            if (response.ok) {
                poi = await response.json();
                poi.id = poi.id || poi._id;
            }
        } catch (e) {
            console.warn('API QR lookup failed:', e);
        }
    }

    if (!poi) {
        alert('Không tìm thấy điểm thuyết minh cho QR này');
        return;
    }

    // Show detail + center map
    showPoiDetail(poi);
    mapManager.centerOnPoi(poi.id);

    // Lưu POI pending để nút nghe có thể phát
    window._pendingQrPoi = poi;

    // Hiện overlay "Bấm để nghe" — cần user gesture cho mobile
    showAudioPrompt(poi);
}

/**
 * Hiện overlay to rõ ràng yêu cầu người dùng bấm để phát audio
 * Giải quyết vấn đề autoplay bị chặn trên điện thoại
 */
function showAudioPrompt(poi) {
    // Xóa prompt cũ nếu có
    const old = document.getElementById('audio-prompt-overlay');
    if (old) old.remove();

    const lang = AppState.language;
    const name = poi.name[lang] || poi.name.vi;

    const overlay = document.createElement('div');
    overlay.id = 'audio-prompt-overlay';
    overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 10000;
        background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
        display: flex; align-items: center; justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    overlay.innerHTML = `
        <div style="
            background: linear-gradient(145deg, #1a1a2e, #16213e);
            border-radius: 20px; padding: 32px 24px; text-align: center;
            max-width: 320px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.1);
        ">
            <div style="font-size: 48px; margin-bottom: 16px;">🎧</div>
            <h3 style="color: #fff; font-size: 18px; margin-bottom: 8px; font-weight: 700;">${name}</h3>
            <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin-bottom: 24px;">Bấm nút bên dưới để nghe thuyết minh</p>
            <button id="audio-prompt-btn" style="
                background: linear-gradient(135deg, #FF6B35, #F7931E);
                color: white; border: none; border-radius: 16px;
                padding: 16px 40px; font-size: 16px; font-weight: 700;
                cursor: pointer; display: flex; align-items: center;
                gap: 10px; margin: 0 auto;
                box-shadow: 0 8px 24px rgba(255,107,53,0.4);
                font-family: 'Inter', sans-serif;
                transition: transform 0.2s, box-shadow 0.2s;
            ">
                <span class="material-icons-round" style="font-size: 24px;">volume_up</span>
                Nghe thuyết minh
            </button>
            <button id="audio-prompt-close" style="
                background: none; border: 1px solid rgba(255,255,255,0.15);
                color: rgba(255,255,255,0.5); border-radius: 10px;
                padding: 10px 24px; font-size: 13px; cursor: pointer;
                margin-top: 12px; font-family: 'Inter', sans-serif;
            ">Bỏ qua</button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Bấm "Nghe thuyết minh" → phát audio (USER GESTURE ✓)
    document.getElementById('audio-prompt-btn').addEventListener('click', () => {
        overlay.remove();
        const p = window._pendingQrPoi;
        if (p) {
            const l = AppState.language;
            const n = p.name[l] || p.name.vi;
            const script = p.ttsScript[l] || p.ttsScript.vi;
            audioManager.playDirect(p.id, script, n);
            window._pendingQrPoi = null;
        }
    });

    // Bấm "Bỏ qua"
    document.getElementById('audio-prompt-close').addEventListener('click', () => {
        overlay.remove();
        window._pendingQrPoi = null;
    });

    // Bấm ngoài cũng đóng
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
            window._pendingQrPoi = null;
        }
    });
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

    // AAC - Nói giúp tôi
    document.getElementById('btn-aac').addEventListener('click', openAACModal);
    document.getElementById('btn-close-aac').addEventListener('click', closeAACModal);
    document.getElementById('aac-backdrop').addEventListener('click', closeAACModal);
    document.getElementById('btn-aac-speak').addEventListener('click', aacSpeak);

    // QR lightbox
    document.getElementById('btn-qr-thumb').addEventListener('click', openQrLightbox);
    document.getElementById('qr-lightbox-backdrop').addEventListener('click', closeQrLightbox);

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterPois(btn.dataset.filter);
        });
    });

    // Toast listen button — bấm để phát thuyết minh (cần user gesture cho mobile)
    document.getElementById('toast-listen').addEventListener('click', () => {
        hideGeofenceToast();

        // Phát audio cho POI pending (từ QR hoặc geofence)
        const poi = window._pendingQrPoi || AppState.selectedPoi;
        if (poi) {
            const lang = AppState.language;
            const name = poi.name[lang] || poi.name.vi;
            const script = poi.ttsScript[lang] || poi.ttsScript.vi;
            audioManager.playDirect(poi.id, script, name);
            window._pendingQrPoi = null;
        }
    });
}

// ==================== UI FUNCTIONS ====================

function changeLanguage(lang) {
    AppState.language = lang;
    audioManager.setLanguage(lang);
    mapManager.updateLanguage(AppState.pois, lang);
    renderPoiList(AppState.pois);
    
    // Update UI text — dùng lastChild.textContent để KHÔNG xóa <span class="material-icons-round">
    // (nếu dùng .innerHTML thì querySelector('.material-icons-round') trong audio callback sẽ return null)
    document.getElementById('gps-text').textContent = AppState.isGpsActive ? t('gpsActive') : t('gpsSearching');
    setBtnText('btn-listen',       t('listen'));
    setBtnText('btn-navigate',     t('navigate'));
    setBtnText('btn-close-detail', t('close'));
    
    // Re-sync audio player bar (đảm bảo pause button vẫn hiện nếu đang phát)
    if (audioManager.onStateChange) {
        audioManager.onStateChange(audioManager.getState ? audioManager.getState() : { isPlaying: false, isPaused: false });
    }
    
    // Update detail if open
    if (AppState.selectedPoi) {
        showPoiDetail(AppState.selectedPoi);
    }
}

/**
 * Cập nhật text của button mà GIỮ NGUYÊN icon <span> bên trong.
 * Tránh rebuild innerHTML làm mất DOM reference của audio callbacks.
 */
function setBtnText(btnId, text) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    // Tìm text node cuối (sau span icon) và update; nếu chưa có thì thêm mới
    const nodes = Array.from(btn.childNodes);
    const textNode = nodes.find(n => n.nodeType === Node.TEXT_NODE);
    if (textNode) {
        textNode.textContent = ' ' + text;
    } else {
        btn.appendChild(document.createTextNode(' ' + text));
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

    // Set QR code ngay trong bottom sheet
    // QR encode URL → khi du khách quét bằng camera sẽ mở app và tự phát thuyết minh
    const qrCode = poi.qrCode || poi.id;
    const qrUrl = `${window.location.origin}/index.html?qr=${encodeURIComponent(qrCode)}`;
    const qrImg = document.getElementById('detail-qr-img');
    if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;
        qrImg.alt = `QR Code - ${poi.name[lang] || poi.name.vi}`;
    }

    document.getElementById('poi-detail').classList.remove('hidden');
    mapManager.setActiveMarker(poi.id);
}

function closePoiDetail() {
    const sheet = document.getElementById('poi-detail');
    sheet.classList.add('hidden');
    sheet.classList.remove('expanded');
    sheet.style.maxHeight = '';
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

// ==================== POI QR DISPLAY ====================

/**
 * Hiển thị QR Code của POI để nhân viên/du khách quét.
 * QR encode URL app → khi quét tự mở app và phát thuyết minh.
 */
function showPoiQr(poi) {
    const lang = AppState.language;
    const name = poi.name[lang] || poi.name.vi;
    const qrCode = poi.qrCode || poi.id;
    
    // URL mà QR sẽ encode: mở app và tự phát thuyết minh
    const appUrl = `${window.location.origin}/index.html?qr=${encodeURIComponent(qrCode)}`;
    
    document.getElementById('poi-qr-name').textContent = name;
    document.getElementById('poi-qr-img').src = 
        `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(appUrl)}`;
    
    document.getElementById('poi-qr-modal').classList.remove('hidden');
}

function closePoiQrModal() {
    document.getElementById('poi-qr-modal').classList.add('hidden');
}

// ==================== BOTTOM SHEET DRAG ====================

/**
 * Kéo handle để:
 * - Kéo lên: mở rộng bottom sheet (thêm class .expanded)
 * - Kéo xuống đủ mạnh: đóng bottom sheet
 */
function setupBottomSheetDrag() {
    const sheet  = document.getElementById('poi-detail');
    const handle = document.getElementById('sheet-handle');
    if (!handle || !sheet) return;

    let startY     = 0;
    let startH     = 0;
    let dragging   = false;

    const onStart = (y) => {
        dragging = true;
        startY   = y;
        startH   = sheet.getBoundingClientRect().height;
        sheet.style.transition = 'none';
    };

    const onMove = (y) => {
        if (!dragging) return;
        const delta  = startY - y;           // dương = kéo lên
        const newH   = Math.min(Math.max(startH + delta, 60), window.innerHeight * 0.82);
        sheet.style.maxHeight = newH + 'px';
    };

    const onEnd = (y) => {
        if (!dragging) return;
        dragging = false;
        sheet.style.transition = '';

        const delta = startY - y;
        if (delta < -80) {
            // Kéo xuống mạnh → đóng
            closePoiDetail();
        } else if (delta > 60) {
            // Kéo lên → mở rộng
            sheet.classList.add('expanded');
            sheet.style.maxHeight = '';
        } else {
            // Trả về mặc định
            sheet.classList.remove('expanded');
            sheet.style.maxHeight = '';
        }
    };

    // Touch
    handle.addEventListener('touchstart', (e) => onStart(e.touches[0].clientY), { passive: true });
    handle.addEventListener('touchmove',  (e) => { e.preventDefault(); onMove(e.touches[0].clientY); }, { passive: false });
    handle.addEventListener('touchend',   (e) => onEnd(e.changedTouches[0].clientY));

    // Mouse (để test trên PC)
    handle.addEventListener('mousedown', (e) => { e.preventDefault(); onStart(e.clientY); });
    window.addEventListener('mousemove', (e) => onMove(e.clientY));
    window.addEventListener('mouseup',   (e) => onEnd(e.clientY));
}

// ==================== QR LIGHTBOX ====================

function openQrLightbox() {
    const poi = AppState.selectedPoi;
    if (!poi) return;

    const lang  = AppState.language;
    const name  = poi.name[lang] || poi.name.vi;
    const qrCode = poi.qrCode || poi.id;
    const appUrl = `${window.location.origin}/index.html?qr=${encodeURIComponent(qrCode)}`;

    document.getElementById('qr-lightbox-name').textContent = name;
    document.getElementById('qr-lightbox-img').src =
        `https://api.qrserver.com/v1/create-qr-code/?size=480x480&data=${encodeURIComponent(appUrl)}`;

    document.getElementById('qr-lightbox').classList.remove('hidden');
}

function closeQrLightbox() {
    document.getElementById('qr-lightbox').classList.add('hidden');
}

// ==================== AAC - NÓI GIÚP TÔI ====================

/** Các câu mẫu thường dùng theo ngôn ngữ */
const AAC_PHRASES = {
    vi: [
        'Xin chào!',
        'Cảm ơn bạn!',
        'Cho tôi xem thực đơn',
        'Tính tiền giúp tôi',
        'Cho tôi 1 ly nước',
        'Không cay',
        'Ít cay thôi',
        'Cho thêm đá',
        'Ngon lắm!',
        'Tôi bị dị ứng hải sản',
        'Nhà vệ sinh ở đâu?',
        'Bao nhiêu tiền?',
        'Cho tôi thêm 1 phần',
        'Chờ một chút',
        'Tôi không ăn được cay',
        'Cho tôi mang về'
    ],
    en: [
        'Hello!',
        'Thank you!',
        'Can I see the menu?',
        'Check please',
        'A glass of water please',
        'Not spicy',
        'A little spicy',
        'More ice please',
        'Delicious!',
        'I\'m allergic to seafood',
        'Where is the restroom?',
        'How much?',
        'One more serving please',
        'Wait a moment',
        'I can\'t eat spicy food',
        'To go please'
    ],
    ja: [
        'こんにちは！',
        'ありがとう！',
        'メニューを見せてください',
        'お会計お願いします',
        '水をください',
        '辛くしないで',
        '少し辛くして',
        '氷を追加して',
        'おいしい！',
        '海鮮アレルギーです',
        'トイレはどこですか？',
        'いくらですか？',
        'もう一つください',
        'ちょっと待ってください',
        '辛い物は食べられません',
        'テイクアウトお願いします'
    ],
    zh: [
        '你好！',
        '谢谢！',
        '请给我看菜单',
        '请结账',
        '请给我一杯水',
        '不要辣',
        '微辣',
        '多加冰',
        '好吃！',
        '我对海鲜过敏',
        '洗手间在哪里？',
        '多少钱？',
        '再来一份',
        '等一下',
        '我不能吃辣',
        '打包带走'
    ]
};

function openAACModal() {
    const modal = document.getElementById('aac-modal');
    modal.classList.remove('hidden');

    // Mặc định load câu mẫu theo ngôn ngữ đang chọn ở màn hình chính
    renderAACPhrases(AppState.language);

    // Focus vào ô nhập
    setTimeout(() => document.getElementById('aac-text').focus(), 300);
}

function closeAACModal() {
    document.getElementById('aac-modal').classList.add('hidden');
    // Dừng phát nếu đang nói
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    const btn = document.getElementById('btn-aac-speak');
    btn.classList.remove('speaking');
    btn.querySelector('.material-icons-round').textContent = 'volume_up';
}

function renderAACPhrases(lang) {
    const container = document.getElementById('aac-phrases');
    const phrases = AAC_PHRASES[lang] || AAC_PHRASES.vi;

    container.innerHTML = phrases.map(phrase =>
        `<button class="aac-phrase-btn" data-phrase="${phrase.replace(/"/g, '&quot;')}">${phrase}</button>`
    ).join('');

    // Click câu mẫu → điền vào ô nhập và phát luôn
    container.querySelectorAll('.aac-phrase-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('aac-text').value = btn.dataset.phrase;
            aacSpeak();
        });
    });
}

function aacSpeak() {
    const text = document.getElementById('aac-text').value.trim();
    if (!text) return;

    const btn = document.getElementById('btn-aac-speak');

    // Nếu đang nói → dừng
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        btn.classList.remove('speaking');
        btn.querySelector('.material-icons-round').textContent = 'volume_up';
        return;
    }

    // Tự động phát hiện ngôn ngữ dựa trên ký tự
    let lang = AppState.language; // Mặc định theo ngôn ngữ app
    if (/[ぁ-んァ-ン]/.test(text)) lang = 'ja';      // Ký tự tiếng Nhật
    else if (/[\u4e00-\u9fa5]/.test(text)) lang = 'zh'; // Ký tự tiếng Trung (Hán tự)
    else if (/[àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳýỵỷỹÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲÝỴỶỸ]/.test(text)) lang = 'vi'; // Có dấu tiếng Việt

    // Map lang code sang BCP47 cho speechSynthesis
    const langMap = { vi: 'vi-VN', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN' };

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[lang] || 'vi-VN';
    utterance.rate = 0.9;  // Nói chậm hơn chút để người nghe hiểu rõ
    utterance.volume = 1.0; // Âm lượng tối đa

    // Tìm giọng tốt nhất
    const voices = window.speechSynthesis.getVoices();
    const targetLang = langMap[lang];
    const bestVoice = voices.find(v => v.lang === targetLang && v.name.includes('Neural'))
        || voices.find(v => v.lang === targetLang)
        || voices.find(v => v.lang.startsWith(lang));
    if (bestVoice) utterance.voice = bestVoice;

    // UI: hiệu ứng đang nói
    btn.classList.add('speaking');
    btn.querySelector('.material-icons-round').textContent = 'stop';

    utterance.onend = () => {
        btn.classList.remove('speaking');
        btn.querySelector('.material-icons-round').textContent = 'volume_up';
    };

    utterance.onerror = () => {
        btn.classList.remove('speaking');
        btn.querySelector('.material-icons-round').textContent = 'volume_up';
    };

    window.speechSynthesis.speak(utterance);
}
