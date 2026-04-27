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

// UI text đa ngôn ngữ (20+ ngôn ngữ, fallback sang EN nếu chưa dịch)
const UI_TEXT = {
    vi: {
        gpsSearching: 'Đang lấy vị trí GPS...', gpsActive: 'GPS đang hoạt động', gpsError: 'Lỗi GPS',
        gpsRealityHint: 'GPS trong phố nhỏ có thể lệch; nếu chưa bắt đúng vị trí, hãy quét QR tại điểm dừng.',
        accuracy: 'Độ chính xác', listen: 'Nghe thuyết minh', navigate: 'Chỉ đường', close: 'Đóng',
        nearPoi: 'Bạn đang ở gần', tapToListen: 'Nhấn để nghe thuyết minh', loading: 'Đang tải dữ liệu...',
        poiList: 'Điểm thuyết minh', all: 'Tất cả', scanQr: 'Quét QR Code',
        qrInstruction: 'Hướng camera vào mã QR tại điểm dừng', qrPlaceTitle: 'Mã QR Địa Điểm',
        qrListenHint: 'Quét để nghe thuyết minh', qrPoiHint: 'Du khách quét mã này để nghe thuyết minh',
        qrNotFoundTitle: 'Không tìm thấy điểm QR',
        qrNotFoundMessage: 'Mã QR này chưa khớp với điểm thuyết minh nào. Vui lòng kiểm tra lại mã hoặc chọn điểm trên bản đồ.',
        cameraErrorTitle: 'Không mở được camera',
        cameraErrorMessage: 'Trình duyệt chưa được cấp quyền camera hoặc thiết bị không hỗ trợ. Bạn vẫn có thể quét bằng camera hệ thống để mở link QR.',
        audioPrompt: 'Bấm nút bên dưới để nghe thuyết minh', skip: 'Bỏ qua', nowPlaying: 'Đang phát...',
        offline: 'Đang offline — Dữ liệu từ bộ nhớ cache', offlineLoading: 'Đang tải dữ liệu offline...',
        connectionError: 'Lỗi kết nối. Đang thử lại...', speakForMe: 'Nói giúp tôi', aacHint: 'Gõ nội dung bạn muốn nói, điện thoại sẽ đọc to giúp bạn',
        aacPlaceholder: 'Nhập nội dung muốn nói...', commonPhrases: '💬 Câu mẫu thường dùng:', speak: 'Phát', myLocation: 'Vị trí của tôi',
        translating: 'Đang dịch giao diện...', translationFallback: 'Không dịch được, hiển thị VI/EN tạm thời', testVoice: 'Đây là bản kiểm tra giọng đọc cho ngôn ngữ đang chọn.',
        seafood: 'Hải sản', hotpot: 'Lẩu', streetFood: 'Đường phố', snack: 'Ăn vặt', landmark: 'Địa danh'
    },
    en: {
        gpsSearching: 'Getting GPS location...', gpsActive: 'GPS is active', gpsError: 'GPS Error',
        gpsRealityHint: 'GPS can drift in narrow food streets; if location is inaccurate, scan the QR code at the stop.',
        accuracy: 'Accuracy', listen: 'Listen to guide', navigate: 'Navigate', close: 'Close',
        nearPoi: 'You are near', tapToListen: 'Tap to listen to the guide', loading: 'Loading data...',
        poiList: 'Points of Interest', all: 'All', scanQr: 'Scan QR Code',
        qrInstruction: 'Point the camera at the QR code at the stop', qrPlaceTitle: 'Place QR Code',
        qrListenHint: 'Scan to listen to the guide', qrPoiHint: 'Visitors scan this code to listen to the guide',
        qrNotFoundTitle: 'QR stop not found',
        qrNotFoundMessage: 'This QR code does not match any guide stop yet. Please check the code or choose a stop on the map.',
        cameraErrorTitle: 'Camera unavailable',
        cameraErrorMessage: 'The browser has no camera permission or this device does not support it. You can still scan the printed QR with the system camera to open the link.',
        audioPrompt: 'Tap the button below to listen to the guide', skip: 'Skip', nowPlaying: 'Now playing...',
        offline: 'Offline — using cached data', offlineLoading: 'Loading offline data...',
        connectionError: 'Connection error. Retrying...', speakForMe: 'Speak for me', aacHint: 'Type what you want to say and the phone will read it aloud',
        aacPlaceholder: 'Type what you want to say...', commonPhrases: '💬 Common phrases:', speak: 'Play', myLocation: 'My location',
        translating: 'Translating interface...', translationFallback: 'Translation unavailable, showing VI/EN temporarily', testVoice: 'This is a voice test for the selected language.',
        seafood: 'Seafood', hotpot: 'Hotpot', streetFood: 'Street food', snack: 'Snack', landmark: 'Landmark'
    },
    ja: {
        gpsSearching: 'GPS位置を取得中...', gpsActive: 'GPS動作中', gpsError: 'GPSエラー',
        accuracy: '精度', listen: 'ガイドを聞く', navigate: 'ナビゲート', close: '閉じる',
        nearPoi: '近くにいます', tapToListen: 'タップしてガイドを聞く', loading: 'データを読み込み中...',
        poiList: 'スポット一覧', all: 'すべて', scanQr: 'QRコードスキャン',
        qrInstruction: 'QRコードにカメラを向けてください',
        seafood: 'シーフード', hotpot: '鍋', streetFood: '屋台', snack: 'スナック', landmark: 'ランドマーク'
    },
    zh: {
        gpsSearching: '正在获取GPS位置...', gpsActive: 'GPS正在运行', gpsError: 'GPS错误',
        accuracy: '精度', listen: '听语音导览', navigate: '导航', close: '关闭',
        nearPoi: '您在附近', tapToListen: '点击收听语音导览', loading: '正在加载数据...',
        poiList: '兴趣点', all: '全部', scanQr: '扫描二维码',
        qrInstruction: '将摄像头对准二维码',
        seafood: '海鲜', hotpot: '火锅', streetFood: '街头美食', snack: '小吃', landmark: '地标'
    },
    ko: {
        gpsSearching: 'GPS 위치 가져오는 중...', gpsActive: 'GPS 활성', gpsError: 'GPS 오류',
        accuracy: '정확도', listen: '가이드 듣기', navigate: '길찾기', close: '닫기',
        nearPoi: '근처에 있습니다', tapToListen: '탭하여 가이드 듣기', loading: '데이터 로딩 중...',
        poiList: '관심 지점', all: '전체', scanQr: 'QR 코드 스캔',
        qrInstruction: 'QR 코드에 카메라를 대세요',
        seafood: '해산물', hotpot: '전골', streetFood: '길거리 음식', snack: '간식', landmark: '랜드마크'
    },
    th: {
        gpsSearching: 'กำลังรับตำแหน่ง GPS...', gpsActive: 'GPS ทำงาน', gpsError: 'GPS ผิดพลาด',
        accuracy: 'ความแม่นยำ', listen: 'ฟังคำบรรยาย', navigate: 'นำทาง', close: 'ปิด',
        nearPoi: 'คุณอยู่ใกล้', tapToListen: 'แตะเพื่อฟัง', loading: 'กำลังโหลด...',
        poiList: 'จุดสนใจ', all: 'ทั้งหมด', scanQr: 'สแกน QR',
        qrInstruction: 'หันกล้องไปที่ QR โค้ด',
        seafood: 'อาหารทะเล', hotpot: 'หม้อ', streetFood: 'อาหารริมทาง', snack: 'ขนม', landmark: 'สถานที่สำคัญ'
    },
    fr: {
        gpsSearching: 'Obtention de la position GPS...', gpsActive: 'GPS actif', gpsError: 'Erreur GPS',
        accuracy: 'Précision', listen: 'Écouter le guide', navigate: 'Naviguer', close: 'Fermer',
        nearPoi: 'Vous êtes près de', tapToListen: 'Appuyez pour écouter', loading: 'Chargement...',
        poiList: 'Points d\'intérêt', all: 'Tous', scanQr: 'Scanner QR',
        qrInstruction: 'Pointez la caméra vers le QR code',
        seafood: 'Fruits de mer', hotpot: 'Fondue', streetFood: 'Street food', snack: 'Snack', landmark: 'Monument'
    },
    es: {
        gpsSearching: 'Obteniendo ubicación GPS...', gpsActive: 'GPS activo', gpsError: 'Error GPS',
        accuracy: 'Precisión', listen: 'Escuchar guía', navigate: 'Navegar', close: 'Cerrar',
        nearPoi: 'Estás cerca de', tapToListen: 'Toca para escuchar', loading: 'Cargando...',
        poiList: 'Puntos de interés', all: 'Todos', scanQr: 'Escanear QR',
        qrInstruction: 'Apunta la cámara al código QR',
        seafood: 'Mariscos', hotpot: 'Fondue', streetFood: 'Comida callejera', snack: 'Snack', landmark: 'Monumento'
    },
    de: {
        gpsSearching: 'GPS-Position wird ermittelt...', gpsActive: 'GPS aktiv', gpsError: 'GPS-Fehler',
        accuracy: 'Genauigkeit', listen: 'Guide anhören', navigate: 'Navigieren', close: 'Schließen',
        nearPoi: 'Sie sind in der Nähe von', tapToListen: 'Tippen zum Anhören', loading: 'Laden...',
        poiList: 'Sehenswürdigkeiten', all: 'Alle', scanQr: 'QR scannen',
        qrInstruction: 'Kamera auf den QR-Code richten',
        seafood: 'Meeresfrüchte', hotpot: 'Eintopf', streetFood: 'Straßenessen', snack: 'Snack', landmark: 'Wahrzeichen'
    },
    ru: {
        gpsSearching: 'Получение GPS-позиции...', gpsActive: 'GPS активен', gpsError: 'Ошибка GPS',
        accuracy: 'Точность', listen: 'Слушать гид', navigate: 'Навигация', close: 'Закрыть',
        nearPoi: 'Вы рядом с', tapToListen: 'Нажмите, чтобы слушать', loading: 'Загрузка...',
        poiList: 'Точки интереса', all: 'Все', scanQr: 'Сканировать QR',
        qrInstruction: 'Наведите камеру на QR-код',
        seafood: 'Морепродукты', hotpot: 'Фондю', streetFood: 'Уличная еда', snack: 'Закуски', landmark: 'Достопримечательность'
    },
    pt: {
        gpsSearching: 'Obtendo localização GPS...', gpsActive: 'GPS ativo', gpsError: 'Erro GPS',
        accuracy: 'Precisão', listen: 'Ouvir guia', navigate: 'Navegar', close: 'Fechar',
        nearPoi: 'Você está perto de', tapToListen: 'Toque para ouvir', loading: 'Carregando...',
        poiList: 'Pontos de interesse', all: 'Todos', scanQr: 'Escanear QR',
        qrInstruction: 'Aponte a câmera para o QR code',
        seafood: 'Frutos do mar', hotpot: 'Panela quente', streetFood: 'Comida de rua', snack: 'Lanche', landmark: 'Marco'
    },
    it: {
        gpsSearching: 'Ottenimento posizione GPS...', gpsActive: 'GPS attivo', gpsError: 'Errore GPS',
        accuracy: 'Precisione', listen: 'Ascolta guida', navigate: 'Naviga', close: 'Chiudi',
        nearPoi: 'Sei vicino a', tapToListen: 'Tocca per ascoltare', loading: 'Caricamento...',
        poiList: 'Punti di interesse', all: 'Tutti', scanQr: 'Scansiona QR',
        qrInstruction: 'Punta la fotocamera sul QR code',
        seafood: 'Frutti di mare', hotpot: 'Pentola calda', streetFood: 'Street food', snack: 'Spuntino', landmark: 'Monumento'
    },
    id: {
        gpsSearching: 'Mendapatkan lokasi GPS...', gpsActive: 'GPS aktif', gpsError: 'GPS Error',
        accuracy: 'Akurasi', listen: 'Dengarkan panduan', navigate: 'Navigasi', close: 'Tutup',
        nearPoi: 'Anda dekat dengan', tapToListen: 'Ketuk untuk mendengarkan', loading: 'Memuat...',
        poiList: 'Tempat menarik', all: 'Semua', scanQr: 'Pindai QR',
        qrInstruction: 'Arahkan kamera ke kode QR',
        seafood: 'Makanan laut', hotpot: 'Sup panas', streetFood: 'Jajanan', snack: 'Camilan', landmark: 'Landmark'
    },
    hi: {
        gpsSearching: 'GPS स्थान प्राप्त हो रहा है...', gpsActive: 'GPS सक्रिय', gpsError: 'GPS त्रुटि',
        accuracy: 'सटीकता', listen: 'गाइड सुनें', navigate: 'नेविगेट', close: 'बंद करें',
        nearPoi: 'आप पास में हैं', tapToListen: 'सुनने के लिए टैप करें', loading: 'लोड हो रहा है...',
        poiList: 'रुचि के स्थान', all: 'सभी', scanQr: 'QR स्कैन',
        qrInstruction: 'QR कोड पर कैमरा रखें',
        seafood: 'सीफूड', hotpot: 'हॉटपॉट', streetFood: 'स्ट्रीट फूड', snack: 'स्नैक', landmark: 'लैंडमार्क'
    },
    ar: {
        gpsSearching: 'جارٍ الحصول على موقع GPS...', gpsActive: 'GPS نشط', gpsError: 'خطأ GPS',
        accuracy: 'الدقة', listen: 'استمع للدليل', navigate: 'التنقل', close: 'إغلاق',
        nearPoi: 'أنت بالقرب من', tapToListen: 'اضغط للاستماع', loading: 'جارٍ التحميل...',
        poiList: 'نقاط الاهتمام', all: 'الكل', scanQr: 'مسح QR',
        qrInstruction: 'وجه الكاميرا نحو رمز QR',
        seafood: 'مأكولات بحرية', hotpot: 'قدر ساخن', streetFood: 'أكل شارع', snack: 'وجبة خفيفة', landmark: 'معلم'
    },
    ms: {
        gpsSearching: 'Mendapatkan lokasi GPS...', gpsActive: 'GPS aktif', gpsError: 'Ralat GPS',
        accuracy: 'Ketepatan', listen: 'Dengar panduan', navigate: 'Navigasi', close: 'Tutup',
        nearPoi: 'Anda berhampiran', tapToListen: 'Ketik untuk dengar', loading: 'Memuatkan...',
        poiList: 'Tempat menarik', all: 'Semua', scanQr: 'Imbas QR',
        qrInstruction: 'Halakan kamera ke kod QR',
        seafood: 'Makanan laut', hotpot: 'Periuk panas', streetFood: 'Makanan jalanan', snack: 'Snek', landmark: 'Mercu tanda'
    },
    tl: {
        gpsSearching: 'Kinukuha ang GPS...', gpsActive: 'GPS aktibo', gpsError: 'GPS Error',
        accuracy: 'Katumpakan', listen: 'Makinig sa gabay', navigate: 'Mag-navigate', close: 'Isara',
        nearPoi: 'Malapit ka sa', tapToListen: 'I-tap para makinig', loading: 'Naglo-load...',
        poiList: 'Mga lugar', all: 'Lahat', scanQr: 'I-scan ang QR',
        qrInstruction: 'Itutok ang camera sa QR code',
        seafood: 'Seafood', hotpot: 'Hotpot', streetFood: 'Street food', snack: 'Meryenda', landmark: 'Landmark'
    },
    nl: {
        gpsSearching: 'GPS-positie ophalen...', gpsActive: 'GPS actief', gpsError: 'GPS-fout',
        accuracy: 'Nauwkeurigheid', listen: 'Luister naar gids', navigate: 'Navigeren', close: 'Sluiten',
        nearPoi: 'U bent in de buurt van', tapToListen: 'Tik om te luisteren', loading: 'Laden...',
        poiList: 'Bezienswaardigheden', all: 'Alle', scanQr: 'QR scannen',
        qrInstruction: 'Richt de camera op de QR-code',
        seafood: 'Zeevruchten', hotpot: 'Stoofpot', streetFood: 'Straatvoedsel', snack: 'Snack', landmark: 'Bezienswaardigheid'
    },
    sv: {
        gpsSearching: 'Hämtar GPS-position...', gpsActive: 'GPS aktiv', gpsError: 'GPS-fel',
        accuracy: 'Noggrannhet', listen: 'Lyssna på guide', navigate: 'Navigera', close: 'Stäng',
        nearPoi: 'Du är nära', tapToListen: 'Tryck för att lyssna', loading: 'Laddar...',
        poiList: 'Sevärdheter', all: 'Alla', scanQr: 'Skanna QR',
        qrInstruction: 'Rikta kameran mot QR-koden',
        seafood: 'Skaldjur', hotpot: 'Gryta', streetFood: 'Gatumat', snack: 'Snacks', landmark: 'Landmärke'
    },
    pl: {
        gpsSearching: 'Pobieranie pozycji GPS...', gpsActive: 'GPS aktywny', gpsError: 'Błąd GPS',
        accuracy: 'Dokładność', listen: 'Słuchaj przewodnika', navigate: 'Nawiguj', close: 'Zamknij',
        nearPoi: 'Jesteś blisko', tapToListen: 'Dotknij, aby słuchać', loading: 'Ładowanie...',
        poiList: 'Punkty zainteresowania', all: 'Wszystkie', scanQr: 'Skanuj QR',
        qrInstruction: 'Skieruj kamerę na kod QR',
        seafood: 'Owoce morza', hotpot: 'Kociołek', streetFood: 'Street food', snack: 'Przekąska', landmark: 'Zabytek'
    }
};

const SOURCE_LANGUAGES = ['vi', 'en'];
const SOURCE_LANGUAGE_PRIORITY = ['vi', 'en'];
const TRANSLATION_CACHE_KEY = 'vinhkhanh_translation_cache_v1';
const UI_SOURCE_TEXT = {
    vi: UI_TEXT.vi,
    en: UI_TEXT.en
};
const runtimeTranslationCache = new Map();

loadPersistentTranslationCache();

function isSourceLanguage(lang) {
    return SOURCE_LANGUAGES.includes(lang);
}

function getSourceLanguage(textMap) {
    if (!textMap) return 'vi';
    for (const lang of SOURCE_LANGUAGE_PRIORITY) {
        if (textMap[lang]) return lang;
    }
    return Object.keys(textMap).find(lang => textMap[lang]) || 'vi';
}

function getSourceText(textMap) {
    const sourceLang = getSourceLanguage(textMap);
    return {
        lang: sourceLang,
        text: textMap?.[sourceLang] || ''
    };
}

function getTranslationCacheKey(scope, id, from, to) {
    return `${scope}:${id}:${from}->${to}`;
}

function t(key) {
    const lang = AppState.language;
    if (isSourceLanguage(lang)) {
        return UI_SOURCE_TEXT[lang]?.[key] || UI_SOURCE_TEXT.en[key] || UI_SOURCE_TEXT.vi[key] || key;
    }

    const sourceLang = getSourceLanguage({ vi: UI_SOURCE_TEXT.vi[key], en: UI_SOURCE_TEXT.en[key] });
    const cacheKey = getTranslationCacheKey('ui', key, sourceLang, lang);
    return runtimeTranslationCache.get(cacheKey) || UI_SOURCE_TEXT.en[key] || UI_SOURCE_TEXT.vi[key] || key;
}

async function getUiText(key, lang = AppState.language) {
    if (isSourceLanguage(lang)) {
        return UI_SOURCE_TEXT[lang]?.[key] || UI_SOURCE_TEXT.en[key] || UI_SOURCE_TEXT.vi[key] || key;
    }

    const { lang: sourceLang, text: sourceText } = getSourceText({
        vi: UI_SOURCE_TEXT.vi[key],
        en: UI_SOURCE_TEXT.en[key]
    });
    return await translateWithCache('ui', key, sourceText || key, sourceLang, lang);
}

async function translateWithCache(scope, id, text, from, to) {
    if (!text || from === to || isSourceLanguage(to) && from === to) return text;

    const cacheKey = getTranslationCacheKey(scope, id, from, to);
    if (runtimeTranslationCache.has(cacheKey)) {
        return runtimeTranslationCache.get(cacheKey);
    }

    try {
        const translated = await translateText(text, from, to);
        const safeText = translated || text;
        runtimeTranslationCache.set(cacheKey, safeText);
        savePersistentTranslationCache();
        return safeText;
    } catch (error) {
        console.warn(`⚠️ Không dịch được [${scope}:${id}] từ ${from} sang ${to}:`, error);
        return text;
    }
}

function loadPersistentTranslationCache() {
    try {
        const raw = localStorage.getItem(TRANSLATION_CACHE_KEY);
        if (!raw) return;
        const entries = JSON.parse(raw);
        if (Array.isArray(entries)) {
            entries.forEach(([key, value]) => runtimeTranslationCache.set(key, value));
        }
    } catch (error) {
        console.warn('⚠️ Không đọc được translation cache:', error);
    }
}

function savePersistentTranslationCache() {
    try {
        const entries = Array.from(runtimeTranslationCache.entries()).slice(-500);
        localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(entries));
    } catch (error) {
        console.warn('⚠️ Không lưu được translation cache:', error);
    }
}

function showTranslationStatus(message) {
    const status = document.getElementById('translation-status');
    const text = document.getElementById('translation-status-text');
    if (!status || !text) return;
    text.textContent = message;
    status.classList.remove('hidden');
}

function hideTranslationStatus() {
    const status = document.getElementById('translation-status');
    if (status) status.classList.add('hidden');
}

async function getLocalizedPoiText(poi, field, lang = AppState.language) {
    const textMap = poi?.[field] || {};

    if (textMap[lang]) return textMap[lang];

    const { lang: sourceLang, text: sourceText } = getSourceText(textMap);
    if (!sourceText) return '';
    if (sourceLang === lang) return sourceText;

    const translated = await translateWithCache(`poi.${field}`, poi.id || poi.qrCode || field, sourceText, sourceLang, lang);
    if (translated && textMap) {
        textMap[lang] = translated;
    }
    return translated;
}

function getLocalizedPoiTextSync(poi, field, lang = AppState.language) {
    const textMap = poi?.[field] || {};
    if (textMap[lang]) return textMap[lang];

    const { lang: sourceLang, text: sourceText } = getSourceText(textMap);
    const cacheKey = getTranslationCacheKey(`poi.${field}`, poi.id || poi.qrCode || field, sourceLang, lang);
    return runtimeTranslationCache.get(cacheKey) || sourceText || textMap[lang] || textMap.vi || textMap.en || '';
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getQrServerUrl(data, size) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}

async function setQrImage(imgEl, data, size = 240) {
    if (!imgEl) return;
    imgEl.alt = 'QR Code';
    try {
        if (window.QRCode?.toDataURL) {
            imgEl.src = await window.QRCode.toDataURL(data, {
                width: size,
                margin: 1,
                errorCorrectionLevel: 'M'
            });
            return;
        }
    } catch (error) {
        console.warn('⚠️ Không tạo QR local được, fallback QR server:', error);
    }

    imgEl.src = getQrServerUrl(data, size);
    imgEl.onerror = () => {
        imgEl.replaceWith(document.createTextNode(data));
    };
}

async function applyUILanguage(lang = AppState.language) {
    document.documentElement.lang = lang;

    const uiKeys = [
        'gpsSearching', 'gpsActive', 'gpsError', 'gpsRealityHint', 'accuracy', 'listen', 'navigate', 'close',
        'poiList', 'all', 'seafood', 'hotpot', 'streetFood', 'snack', 'landmark',
        'scanQr', 'qrInstruction', 'qrPlaceTitle', 'qrListenHint', 'qrPoiHint',
        'qrNotFoundTitle', 'qrNotFoundMessage', 'cameraErrorTitle', 'cameraErrorMessage',
        'offline', 'speakForMe', 'aacHint', 'aacPlaceholder', 'commonPhrases',
        'speak', 'myLocation', 'tapToListen', 'audioPrompt', 'skip', 'nowPlaying',
        'translating', 'translationFallback', 'testVoice'
    ];
    await Promise.all(uiKeys.map(key => getUiText(key, lang)));

    const gpsText = document.getElementById('gps-text');
    if (gpsText) gpsText.textContent = AppState.isGpsActive ? t('gpsActive') : t('gpsSearching');

    const gpsAccuracy = document.getElementById('gps-accuracy');
    if (gpsAccuracy?.textContent && geofenceManager?.currentPosition?.accuracy) {
        gpsAccuracy.textContent = `${t('accuracy')}: ±${Math.round(geofenceManager.currentPosition.accuracy)}m`;
    }
    const gpsRealityText = document.getElementById('gps-reality-text');
    if (gpsRealityText) gpsRealityText.textContent = t('gpsRealityHint');

    setBtnText('btn-listen', t('listen'));
    setBtnText('btn-navigate', t('navigate'));
    setBtnText('btn-close-detail', t('close'));
    setBtnText('toast-listen', t('listen'));

    const panelTitle = document.querySelector('#poi-panel .poi-panel-header h2');
    if (panelTitle) panelTitle.textContent = '📍 ' + t('poiList');

    const filterMap = {
        all: t('all'),
        seafood: '🦐 ' + t('seafood'),
        hotpot: '🍲 ' + t('hotpot'),
        street_food: '🍜 ' + t('streetFood'),
        snack: '🧁 ' + t('snack'),
        landmark: '🏛️ ' + t('landmark')
    };
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const key = btn.dataset.filter;
        if (filterMap[key]) btn.textContent = filterMap[key];
    });

    const qrTitle = document.querySelector('#qr-modal .modal-header h2');
    if (qrTitle) qrTitle.innerHTML = `<span class="material-icons-round">qr_code_scanner</span> ${escapeHtml(t('scanQr'))}`;
    const qrInstruction = document.querySelector('.qr-instruction');
    if (qrInstruction) qrInstruction.textContent = t('qrInstruction');
    const poiQrTitle = document.querySelector('#poi-qr-modal .modal-header h2');
    if (poiQrTitle) poiQrTitle.innerHTML = `<span class="material-icons-round">qr_code_2</span> ${escapeHtml(t('qrPlaceTitle'))}`;
    const poiQrHint = document.querySelector('#poi-qr-modal .modal-content p[style*="font-size:13px"]');
    if (poiQrHint) poiQrHint.textContent = t('qrPoiHint');
    const qrLightboxHint = document.querySelector('.qr-lightbox-hint');
    if (qrLightboxHint) qrLightboxHint.innerHTML = `<span class="material-icons-round" style="font-size:18px;vertical-align:middle;">smartphone</span> ${escapeHtml(t('qrListenHint'))}`;

    const aacTitle = document.querySelector('#aac-modal .modal-header h2');
    if (aacTitle) aacTitle.innerHTML = `<span class="material-icons-round">record_voice_over</span> ${escapeHtml(t('speakForMe'))}`;
    const aacHint = document.querySelector('.aac-hint');
    if (aacHint) aacHint.textContent = t('aacHint');
    const aacText = document.getElementById('aac-text');
    if (aacText) aacText.placeholder = t('aacPlaceholder');
    const aacSpeakBtn = document.getElementById('btn-aac-speak');
    if (aacSpeakBtn) aacSpeakBtn.title = t('speak');
    const phrasesLabel = document.querySelector('.aac-phrases-label');
    if (phrasesLabel) phrasesLabel.textContent = t('commonPhrases');

    const offlineText = document.querySelector('#offline-banner span:last-child');
    if (offlineText) offlineText.textContent = t('offline');
    const audioTitle = document.getElementById('audio-title');
    if (audioTitle && audioTitle.textContent === (UI_SOURCE_TEXT.vi.nowPlaying || UI_SOURCE_TEXT.en.nowPlaying)) audioTitle.textContent = t('nowPlaying');

    const btnQr = document.getElementById('btn-qr');
    if (btnQr) btnQr.title = t('scanQr');
    const btnAac = document.getElementById('btn-aac');
    if (btnAac) btnAac.title = t('speakForMe');
    const btnMyLocation = document.getElementById('btn-my-location');
    if (btnMyLocation) btnMyLocation.title = t('myLocation');
    const btnToggleList = document.getElementById('btn-toggle-list');
    if (btnToggleList) btnToggleList.title = t('poiList');
    const btnTestTts = document.getElementById('btn-test-tts');
    if (btnTestTts) btnTestTts.title = t('testVoice');
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
            updateSplashStatus(t('offlineLoading'));
            const cachedPois = await offlineDB.loadPois();
            if (cachedPois && cachedPois.length > 0) {
                pois = cachedPois;
            } else {
                console.warn('⚠️ Không có offline cache, dùng dữ liệu demo VI/EN để trình bày.');
                pois = getDemoPois();
            }
        }

        AppState.pois = pois;

        // Add POIs to map
        mapManager.addPois(pois, AppState.language);

        // Setup geofence
        geofenceManager.setPois(pois);

        // Render POI list
        renderPoiList(pois);
        await applyUILanguage(AppState.language);

        console.log(`✅ Loaded ${pois.length} POIs ${isOffline ? '(Offline)' : ''}`);
    } catch (error) {
        console.error('❌ Error loading POIs:', error);
        updateSplashStatus(t('connectionError'));
        // Retry after 3s
        setTimeout(loadPois, 3000);
    }
}

function getDemoPois() {
    return [
        {
            id: 'demo-oc-dao',
            name: { vi: 'Ốc Đào Vĩnh Khánh', en: 'Oc Dao Vinh Khanh' },
            description: {
                vi: 'Quán ốc nổi tiếng trên phố Vĩnh Khánh, phù hợp để giới thiệu trải nghiệm ẩm thực đường phố Sài Gòn.',
                en: 'A famous snail restaurant on Vinh Khanh Street, ideal for introducing Saigon street food culture.'
            },
            ttsScript: {
                vi: 'Xin chào! Bạn đang ở gần Ốc Đào Vĩnh Khánh, một địa điểm ẩm thực nổi bật của Quận 4. Nội dung này được nhập bằng tiếng Việt và có thể dịch tự động sang ngôn ngữ du khách chọn.',
                en: 'Hello! You are near Oc Dao Vinh Khanh, a well-known food stop in District 4. This source text can be translated automatically into the visitor selected language.'
            },
            latitude: 10.7559,
            longitude: 106.6944,
            radius: 40,
            priority: 1,
            category: 'seafood',
            address: '212B Vĩnh Khánh, Quận 4, TP.HCM',
            openingHours: '16:00 - 23:00',
            priceRange: '50.000 - 150.000 VNĐ',
            qrCode: 'VK-DEMO-001',
            isActive: true
        },
        {
            id: 'demo-lau-bo',
            name: { vi: 'Lẩu Bò Vĩnh Khánh', en: 'Vinh Khanh Beef Hotpot' },
            description: {
                vi: 'Điểm ăn tối quen thuộc với món lẩu bò nóng, thích hợp để demo danh mục, bản đồ, QR và thuyết minh tự động.',
                en: 'A familiar dinner stop with hot beef hotpot, useful for demonstrating category filters, map, QR and automatic narration.'
            },
            ttsScript: {
                vi: 'Đây là điểm lẩu bò demo trên phố Vĩnh Khánh. Ứng dụng lấy văn bản nguồn tiếng Việt hoặc tiếng Anh, sau đó dịch runtime nếu khách chọn ngôn ngữ khác.',
                en: 'This is a demo beef hotpot stop on Vinh Khanh Street. The app uses Vietnamese or English source text, then translates it at runtime when visitors choose another language.'
            },
            latitude: 10.7570,
            longitude: 106.6950,
            radius: 35,
            priority: 2,
            category: 'hotpot',
            address: 'Vĩnh Khánh, Quận 4, TP.HCM',
            openingHours: '17:00 - 22:30',
            priceRange: '80.000 - 180.000 VNĐ',
            qrCode: 'VK-DEMO-002',
            isActive: true
        }
    ];
}

// ==================== QR URL HANDLER ====================

/**
 * Xử lý khi mở app bằng cách quét QR Code tại cửa hàng.
 * URL: /index.html?qr=VK-POI-001
 * Tự động tìm POI, mở chi tiết và hiện nút nghe để đúng chính sách mobile autoplay.
 */
function handleQrUrlParam() {
    const params = new URLSearchParams(window.location.search);
    const qrCode = params.get('qr');
    if (!qrCode) return;

    console.log('📱 Mở app qua QR Code:', qrCode);

    // Đợi splash/map ổn định, sau đó dùng chung luồng QR scanner.
    setTimeout(() => handleQrCode(qrCode), 1800);
}

/**
 * Lấy script thuyết minh đúng ngôn ngữ.
 * VI/EN là ngôn ngữ nguồn cố định. Các ngôn ngữ khác dịch runtime và cache ở client.
 */
async function getPoiScript(poi, lang) {
    if (isSourceLanguage(lang) && poi.ttsScript?.[lang]) {
        return poi.ttsScript[lang];
    }

    const { lang: sourceLang, text: sourceText } = getSourceText(poi.ttsScript);
    if (!sourceText) return '';
    if (lang === sourceLang) return sourceText;

    const translated = await translateWithCache('poi.ttsScript', poi.id || poi.qrCode || 'tts', sourceText, sourceLang, lang);
    if (translated) {
        if (!poi.ttsScript) poi.ttsScript = {};
        poi.ttsScript[lang] = translated;
        console.log(`🌐 Đã dịch thuyết minh từ [${sourceLang}] sang [${lang}]:`, translated.substring(0, 50) + '...');
        return translated;
    }

    return sourceText;
}

/**
 * Dịch văn bản bằng Google Translate API (client-side, miễn phí)
 * @param {string} text - Văn bản cần dịch
 * @param {string} from - Mã ngôn ngữ nguồn (vd: 'vi')
 * @param {string} to - Mã ngôn ngữ đích (vd: 'ko')
 * @returns {Promise<string>} Văn bản đã dịch
 */
async function translateText(text, from, to) {
    // Chia nhỏ text nếu dài quá (Google giới hạn ~5000 ký tự/request)
    const maxLen = 4500;
    if (text.length <= maxLen) {
        return await _translateChunk(text, from, to);
    }

    // Chia theo câu
    const sentences = text.split(/(?<=[.!?。\n])\s*/);
    let chunks = [];
    let current = '';
    for (const s of sentences) {
        if ((current + s).length <= maxLen) {
            current += s;
        } else {
            if (current) chunks.push(current);
            current = s;
        }
    }
    if (current) chunks.push(current);

    const results = await Promise.all(chunks.map(c => _translateChunk(c, from, to)));
    return results.join(' ');
}

async function _translateChunk(text, from, to) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    // Response format: [[["đoạn dịch", "đoạn gốc"], ...], ...]
    if (data && data[0]) {
        return data[0].map(item => item[0]).join('');
    }
    return text;
}

function updateNetworkStatus() {
    const banner = document.getElementById('offline-banner');
    if (!banner) return;
    
    if (!navigator.onLine) {
        banner.classList.remove('hidden');
        const text = banner.querySelector('span:last-child');
        if (text) text.textContent = t('offline');
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
        document.getElementById('gps-reality-hint')?.classList.add('hidden');
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
        const name = getLocalizedPoiTextSync(fullPoi, 'name', lang);

        // Show toast notification
        showGeofenceToast(name, fullPoi);

        // Auto-play TTS với dịch tự động nếu cần
        (async () => {
            const script = await getPoiScript(fullPoi, lang);
            audioManager.enqueue(poi.id, script, name, poi.priority);
        })();

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
            AppState.isGpsActive = false;
        }
    };

    geofenceManager.onError = async (message) => {
        const gpsText = document.getElementById('gps-text');
        const gpsHint = document.getElementById('gps-reality-hint');
        const gpsHintText = document.getElementById('gps-reality-text');
        const friendlyTitle = await getUiText('gpsError', AppState.language);
        const friendlyHint = await getUiText('gpsRealityHint', AppState.language);

        gpsText.textContent = isSourceLanguage(AppState.language) ? message : friendlyTitle;
        if (gpsHintText) gpsHintText.textContent = friendlyHint;
        gpsHint?.classList.remove('hidden');
        showAppMessage(friendlyTitle, `${isSourceLanguage(AppState.language) ? message + '. ' : ''}${friendlyHint}`, 'gps_off', 7000);
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
    qrScanner.onError = async () => {
        closeQRModal();
        showAppMessage(
            await getUiText('cameraErrorTitle', AppState.language),
            await getUiText('cameraErrorMessage', AppState.language),
            'photo_camera_off',
            7000
        );
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
        showAppMessage(
            await getUiText('qrNotFoundTitle', AppState.language),
            await getUiText('qrNotFoundMessage', AppState.language),
            'qr_code_2',
            7000
        );
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
async function showAudioPrompt(poi) {
    // Xóa prompt cũ nếu có
    const old = document.getElementById('audio-prompt-overlay');
    if (old) old.remove();

    const lang = AppState.language;
    const name = await getLocalizedPoiText(poi, 'name', lang);
    const promptText = await getUiText('audioPrompt', lang);
    const listenText = await getUiText('listen', lang);
    const skipText = await getUiText('skip', lang);

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
            <h3 style="color: #fff; font-size: 18px; margin-bottom: 8px; font-weight: 700;">${escapeHtml(name)}</h3>
            <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin-bottom: 24px;">${escapeHtml(promptText)}</p>
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
                ${escapeHtml(listenText)}
            </button>
            <button id="audio-prompt-close" style="
                background: none; border: 1px solid rgba(255,255,255,0.15);
                color: rgba(255,255,255,0.5); border-radius: 10px;
                padding: 10px 24px; font-size: 13px; cursor: pointer;
                margin-top: 12px; font-family: 'Inter', sans-serif;
            ">${escapeHtml(skipText)}</button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Bấm "Nghe thuyết minh" → phát audio (USER GESTURE ✓)
    document.getElementById('audio-prompt-btn').addEventListener('click', async () => {
        overlay.remove();
        const p = window._pendingQrPoi;
        if (p) {
            const l = AppState.language;
            const n = await getLocalizedPoiText(p, 'name', l);
            const script = await getPoiScript(p, l);
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
    // Language selector (dropdown)
    document.getElementById('lang-select').addEventListener('change', (e) => {
        changeLanguage(e.target.value);
    });
    document.getElementById('btn-test-tts').addEventListener('click', testCurrentLanguageVoice);

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
    document.getElementById('btn-my-location').addEventListener('click', async () => {
        if (!mapManager.centerOnUser()) {
            showAppMessage(
                await getUiText('gpsError', AppState.language),
                await getUiText('gpsRealityHint', AppState.language),
                'gps_off',
                6000
            );
        }
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
    document.getElementById('btn-listen').addEventListener('click', async () => {
        if (AppState.selectedPoi) {
            const lang = AppState.language;
            const poi = AppState.selectedPoi;
            const name = await getLocalizedPoiText(poi, 'name', lang);
            const script = await getPoiScript(poi, lang);
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
    document.getElementById('toast-listen').addEventListener('click', async () => {
        hideGeofenceToast();

        // Phát audio cho POI pending (từ QR hoặc geofence)
        const poi = window._pendingQrPoi || AppState.selectedPoi;
        if (poi) {
            const lang = AppState.language;
            const name = await getLocalizedPoiText(poi, 'name', lang);
            const script = await getPoiScript(poi, lang);
            audioManager.playDirect(poi.id, script, name);
            window._pendingQrPoi = null;
        }
    });
}

async function testCurrentLanguageVoice() {
    const lang = AppState.language;
    const text = await getUiText('testVoice', lang);
    audioManager.setLanguage(lang);
    audioManager.playDirect(`voice-test-${lang}`, text, `TTS ${lang.toUpperCase()}`);
}

// ==================== UI FUNCTIONS ====================

async function changeLanguage(lang) {
    AppState.language = lang;
    showTranslationStatus(t('translating'));
    try {
        const select = document.getElementById('lang-select');
        if (select && select.value !== lang) select.value = lang;
        audioManager.setLanguage(lang);
        await Promise.all(AppState.pois.map(async poi => {
            await getLocalizedPoiText(poi, 'name', lang);
            await getLocalizedPoiText(poi, 'description', lang);
        }));
        mapManager.updateLanguage(AppState.pois, lang);
        renderPoiList(AppState.pois);
        await applyUILanguage(lang);
        
        // Re-sync audio player bar
        if (audioManager.onStateChange) {
            audioManager.onStateChange(audioManager.getState ? audioManager.getState() : { isPlaying: false, isPaused: false });
        }
        
        // Update detail if open
        if (AppState.selectedPoi) {
            await showPoiDetail(AppState.selectedPoi);
        }

        const qrLightbox = document.getElementById('qr-lightbox');
        if (AppState.selectedPoi && qrLightbox && !qrLightbox.classList.contains('hidden')) {
            await openQrLightbox();
        }
    } finally {
        hideTranslationStatus();
    }
}

/**
 * Cập nhật text của button mà GIỮ NGUYÊN icon <span> bên trong.
 * Tránh rebuild innerHTML làm mất DOM reference của audio callbacks.
 */
function setBtnText(btnId, text) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    Array.from(btn.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .forEach(node => node.remove());
    btn.appendChild(document.createTextNode(' ' + text));
}


function renderPoiList(pois, filter = 'all') {
    const listEl = document.getElementById('poi-list');
    const lang = AppState.language;
    const emoji = { 'seafood': '🦐', 'hotpot': '🍲', 'snack': '🧁', 'street_food': '🍜', 'landmark': '🏛️' };

    const filtered = filter === 'all' ? pois : pois.filter(p => p.category === filter);

    listEl.innerHTML = filtered.map(poi => {
        const name = getLocalizedPoiTextSync(poi, 'name', lang);
        const desc = getLocalizedPoiTextSync(poi, 'description', lang);
        const icon = emoji[poi.category] || '📍';
        const distance = geofenceManager.getDistanceTo(poi.latitude, poi.longitude);
        const distText = GeofenceManager.formatDistance(distance);

        return `
            <div class="poi-item" data-poi-id="${poi.id}" onclick="onPoiItemClick('${poi.id}')">
                <div class="poi-item-icon ${poi.category}">${icon}</div>
                <div class="poi-item-info">
                    <div class="poi-item-name">${escapeHtml(name)}</div>
                    <div class="poi-item-desc">${escapeHtml(desc)}</div>
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

async function showPoiDetail(poi) {
    AppState.selectedPoi = poi;
    const lang = AppState.language;
    const categoryKeyMap = {
        seafood: 'seafood',
        hotpot: 'hotpot',
        snack: 'snack',
        street_food: 'streetFood',
        landmark: 'landmark'
    };
    const name = await getLocalizedPoiText(poi, 'name', lang);
    const description = await getLocalizedPoiText(poi, 'description', lang);

    const catEl = document.getElementById('detail-category');
    catEl.textContent = t(categoryKeyMap[poi.category]) || poi.category;
    catEl.className = `poi-detail-category ${poi.category}`;

    document.getElementById('detail-name').textContent = name;
    document.getElementById('detail-address').textContent = poi.address || '';
    document.getElementById('detail-description').textContent = description;
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
        qrImg.alt = `QR Code - ${name}`;
        setQrImage(qrImg, qrUrl, 200);
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
    const icon = toast.querySelector('.toast-icon .material-icons-round');
    const action = document.getElementById('toast-listen');

    if (icon) icon.textContent = 'place';
    if (action) {
        action.classList.remove('hidden');
        action.textContent = t('listen');
    }
    title.textContent = `${t('nearPoi')}: ${poiName}`;
    message.textContent = t('tapToListen');
    
    toast.classList.remove('hidden');
    toast.classList.remove('fade-out');

    // Auto hide after 8s
    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(hideGeofenceToast, 8000);
}

function showAppMessage(titleText, messageText, iconName = 'info', duration = 6000) {
    const toast = document.getElementById('geofence-toast');
    const title = document.getElementById('toast-title');
    const message = document.getElementById('toast-message');
    const icon = toast?.querySelector('.toast-icon .material-icons-round');
    const action = document.getElementById('toast-listen');
    if (!toast || !title || !message) return;

    if (icon) icon.textContent = iconName;
    if (action) action.classList.add('hidden');
    title.textContent = titleText;
    message.textContent = messageText;

    toast.classList.remove('hidden');
    toast.classList.remove('fade-out');

    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(hideGeofenceToast, duration);
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
async function showPoiQr(poi) {
    const lang = AppState.language;
    const name = await getLocalizedPoiText(poi, 'name', lang);
    const qrCode = poi.qrCode || poi.id;
    
    // URL mà QR sẽ encode: mở app và tự phát thuyết minh
    const appUrl = `${window.location.origin}/index.html?qr=${encodeURIComponent(qrCode)}`;
    
    document.getElementById('poi-qr-name').textContent = name;
    setQrImage(document.getElementById('poi-qr-img'), appUrl, 400);
    
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

async function openQrLightbox() {
    const poi = AppState.selectedPoi;
    if (!poi) return;

    const lang  = AppState.language;
    const name  = await getLocalizedPoiText(poi, 'name', lang);
    const qrCode = poi.qrCode || poi.id;
    const appUrl = `${window.location.origin}/index.html?qr=${encodeURIComponent(qrCode)}`;

    document.getElementById('qr-lightbox-name').textContent = name;
    setQrImage(document.getElementById('qr-lightbox-img'), appUrl, 480);

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

async function openAACModal() {
    const modal = document.getElementById('aac-modal');
    modal.classList.remove('hidden');

    // Mặc định load câu mẫu theo ngôn ngữ đang chọn ở màn hình chính
    await renderAACPhrases(AppState.language);

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

async function renderAACPhrases(lang) {
    const container = document.getElementById('aac-phrases');
    let phrases = AAC_PHRASES[lang];
    if (!phrases) {
        const sourceLang = AAC_PHRASES.vi ? 'vi' : 'en';
        phrases = await Promise.all(AAC_PHRASES[sourceLang].map((phrase, index) =>
            translateWithCache('aac.phrase', index, phrase, sourceLang, lang)
        ));
        AAC_PHRASES[lang] = phrases;
    }

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
    if (window.speechSynthesis.speaking || window._aacGoogleAudio) {
        window.speechSynthesis.cancel();
        if (window._aacGoogleAudio) {
            window._aacGoogleAudio.pause();
            window._aacGoogleAudio = null;
        }
        btn.classList.remove('speaking');
        btn.querySelector('.material-icons-round').textContent = 'volume_up';
        return;
    }

    // ============ AI LANGUAGE DETECTION (50+ ngôn ngữ) ============
    const detectedLang = detectLanguage(text);
    console.log(`🌍 AAC: Phát hiện ngôn ngữ "${detectedLang}" cho text: "${text.substring(0, 30)}..."`);

    // UI: hiệu ứng đang nói
    btn.classList.add('speaking');
    btn.querySelector('.material-icons-round').textContent = 'stop';

    const resetBtn = () => {
        btn.classList.remove('speaking');
        btn.querySelector('.material-icons-round').textContent = 'volume_up';
    };

    // Thử Web Speech API trước
    const voices = window.speechSynthesis.getVoices();
    const hasVoice = voices.some(v => v.lang.toLowerCase().startsWith(detectedLang.split('-')[0]));

    if (hasVoice) {
        // Có voice → dùng Web Speech API
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = detectedLang;
        utterance.rate = 0.9;
        utterance.volume = 1.0;

        const langPrefix = detectedLang.split('-')[0];
        const bestVoice = voices.find(v => v.lang === detectedLang && v.name.includes('Neural'))
            || voices.find(v => v.lang === detectedLang)
            || voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
        if (bestVoice) utterance.voice = bestVoice;

        // Fallback: nếu sau 3 giây không phát → chuyển Google TTS
        let started = false;
        const fallback = setTimeout(() => {
            if (!started) {
                window.speechSynthesis.cancel();
                _aacGoogleTTS(text, detectedLang, resetBtn);
            }
        }, 3000);

        utterance.onstart = () => { started = true; clearTimeout(fallback); };
        utterance.onend = () => { clearTimeout(fallback); resetBtn(); };
        utterance.onerror = (e) => {
            clearTimeout(fallback);
            if (e.error !== 'canceled') _aacGoogleTTS(text, detectedLang, resetBtn);
            else resetBtn();
        };

        window.speechSynthesis.speak(utterance);
    } else {
        // Không có voice → Google Translate TTS fallback
        _aacGoogleTTS(text, detectedLang, resetBtn);
    }
}

/**
 * Google Translate TTS fallback cho AAC — hoạt động mọi thiết bị
 */
function _aacGoogleTTS(text, langCode, onDone) {
    const tl = langCode.split('-')[0]; // vi-VN → vi
    // Chia đoạn nếu text dài
    const chunks = [];
    const maxLen = 190;
    if (text.length <= maxLen) {
        chunks.push(text);
    } else {
        const sentences = text.split(/(?<=[.!?。！？;；,，])\s*/);
        let current = '';
        for (const s of sentences) {
            if ((current + ' ' + s).trim().length <= maxLen) {
                current = (current + ' ' + s).trim();
            } else {
                if (current) chunks.push(current);
                if (s.length > maxLen) {
                    for (let i = 0; i < s.length; i += maxLen) chunks.push(s.substring(i, i + maxLen));
                    current = '';
                } else {
                    current = s;
                }
            }
        }
        if (current) chunks.push(current);
    }

    let idx = 0;
    function playNext() {
        if (idx >= chunks.length) {
            window._aacGoogleAudio = null;
            if (onDone) onDone();
            return;
        }
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${encodeURIComponent(chunks[idx])}`;
        const audio = new Audio(url);
        window._aacGoogleAudio = audio;
        audio.volume = 1.0;
        audio.onended = () => { idx++; playNext(); };
        audio.onerror = () => { idx++; playNext(); };
        audio.play().catch(() => { if (onDone) onDone(); });
    }
    playNext();
}

/**
 * Phát hiện ngôn ngữ tự động dựa trên Unicode Range + Pattern Matching
 * Hỗ trợ 50+ ngôn ngữ phổ biến nhất thế giới
 * Trả về BCP47 lang code (vd: 'vi-VN', 'ko-KR', 'th-TH')
 */
function detectLanguage(text) {
    if (!text || text.length === 0) return 'vi-VN';

    // Bảng quét Unicode cho các hệ chữ viết đặc trưng
    const scriptDetectors = [
        // Tiếng Việt: các ký tự dấu đặc trưng
        { test: /[àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳýỵỷỹ]/i, lang: 'vi-VN' },
        // Tiếng Nhật: Hiragana + Katakana
        { test: /[\u3040-\u309F\u30A0-\u30FF]/, lang: 'ja-JP' },
        // Tiếng Hàn: Hangul
        { test: /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/, lang: 'ko-KR' },
        // Tiếng Trung: CJK Ideographs (nếu không có Hiragana/Katakana/Hangul)
        { test: /[\u4E00-\u9FFF\u3400-\u4DBF]/, lang: 'zh-CN' },
        // Tiếng Thái
        { test: /[\u0E00-\u0E7F]/, lang: 'th-TH' },
        // Tiếng Ả Rập
        { test: /[\u0600-\u06FF\u0750-\u077F]/, lang: 'ar-SA' },
        // Tiếng Hebrew
        { test: /[\u0590-\u05FF]/, lang: 'he-IL' },
        // Tiếng Hindi / Devanagari
        { test: /[\u0900-\u097F]/, lang: 'hi-IN' },
        // Tiếng Bengali
        { test: /[\u0980-\u09FF]/, lang: 'bn-BD' },
        // Tiếng Tamil
        { test: /[\u0B80-\u0BFF]/, lang: 'ta-IN' },
        // Tiếng Telugu
        { test: /[\u0C00-\u0C7F]/, lang: 'te-IN' },
        // Tiếng Kannada
        { test: /[\u0C80-\u0CFF]/, lang: 'kn-IN' },
        // Tiếng Malayalam
        { test: /[\u0D00-\u0D7F]/, lang: 'ml-IN' },
        // Tiếng Myanmar
        { test: /[\u1000-\u109F]/, lang: 'my-MM' },
        // Tiếng Khmer (Campuchia)
        { test: /[\u1780-\u17FF]/, lang: 'km-KH' },
        // Tiếng Lào
        { test: /[\u0E80-\u0EFF]/, lang: 'lo-LA' },
        // Tiếng Georgia
        { test: /[\u10A0-\u10FF]/, lang: 'ka-GE' },
        // Tiếng Armenia
        { test: /[\u0530-\u058F]/, lang: 'hy-AM' },
        // Tiếng Ethiopia (Amharic)
        { test: /[\u1200-\u137F]/, lang: 'am-ET' },
        // Tiếng Hy Lạp
        { test: /[\u0370-\u03FF]/, lang: 'el-GR' },
        // Tiếng Nga / Cyrillic
        { test: /[\u0400-\u04FF]/, lang: 'ru-RU' },
        // Tiếng Gujarati
        { test: /[\u0A80-\u0AFF]/, lang: 'gu-IN' },
        // Tiếng Punjabi (Gurmukhi)
        { test: /[\u0A00-\u0A7F]/, lang: 'pa-IN' },
        // Tiếng Sinhala (Sri Lanka)
        { test: /[\u0D80-\u0DFF]/, lang: 'si-LK' },
        // Tiếng Tibetan
        { test: /[\u0F00-\u0FFF]/, lang: 'bo-CN' },
    ];

    // Quét theo hệ chữ viết (ưu tiên cao nhất, luôn chính xác)
    for (const detector of scriptDetectors) {
        if (detector.test.test(text)) {
            return detector.lang;
        }
    }

    // Nếu toàn ký tự Latin → phân biệt tiếp bằng đặc trưng ngôn ngữ
    const latinDetectors = [
        // Tiếng Đức: ß, ü, ö, ä
        { test: /[ßüöäÜÖÄ]/, lang: 'de-DE' },
        // Tiếng Pháp: ç, œ, ê, è, à, ù, â, î, ô, û, ë, ï, ÿ
        { test: /[çœŒêèùâîôûëïÿ]/i, lang: 'fr-FR' },
        // Tiếng Tây Ban Nha: ñ, ¿, ¡
        { test: /[ñ¿¡]/i, lang: 'es-ES' },
        // Tiếng Bồ Đào Nha: ã, õ, ç (không dấu Việt)
        { test: /[ãõç]/i, lang: 'pt-BR' },
        // Tiếng Thổ Nhĩ Kỳ: ğ, ı, ş, ç
        { test: /[ğışŞİĞ]/, lang: 'tr-TR' },
        // Tiếng Ba Lan: ą, ć, ę, ł, ń, ó, ś, ź, ż
        { test: /[ąćęłńśźżĄĆĘŁŃŚŹŻ]/, lang: 'pl-PL' },
        // Tiếng Séc: ě, š, č, ř, ž, ů, ď, ť, ň
        { test: /[ěščřžůďťň]/i, lang: 'cs-CZ' },
        // Tiếng Romania: ă, â, î, ș, ț
        { test: /[ășțĂÂÎȘȚ]/, lang: 'ro-RO' },
        // Tiếng Hungary: ő, ű
        { test: /[őűŐŰ]/, lang: 'hu-HU' },
        // Tiếng Hà Lan: ij, đặc điểm từ
        { test: /\b(de|het|een|van|en|is|dat|niet|zijn|voor)\b/i, lang: 'nl-NL' },
        // Tiếng Thụy Điển: å
        { test: /[åÅ]/, lang: 'sv-SE' },
        // Tiếng Na Uy / Đan Mạch: ø, æ
        { test: /[øæØÆ]/, lang: 'no-NO' },
        // Tiếng Phần Lan: ä, ö + đặc trung từ
        { test: /\b(ja|on|ei|se|hän|mutta)\b/i, lang: 'fi-FI' },
        // Tiếng Indonesia / Malay
        { test: /\b(dan|yang|di|ini|itu|untuk|dengan|dari|tidak|saya)\b/i, lang: 'id-ID' },
        // Tiếng Tagalog (Philippines)
        { test: /\b(ang|ng|sa|na|mga|ko|niya|ito|ay)\b/i, lang: 'tl-PH' },
        // Tiếng Swahili
        { test: /\b(na|ya|wa|ni|kwa|katika|kuwa|hii)\b/i, lang: 'sw-KE' },
    ];

    for (const detector of latinDetectors) {
        if (detector.test.test(text)) {
            return detector.lang;
        }
    }

    // Mặc định: tiếng Anh (chữ Latin thuần, không dấu)
    return 'en-US';
}
