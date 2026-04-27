/**
 * Admin CMS JavaScript
 * Quản lý POI, Tour, Analytics, Translations
 */

let adminToken = sessionStorage.getItem('adminToken') || '';
let adminPois = [];
let adminTours = [];
let heatmapMap = null;
const QR_ORIGIN_KEY = 'vinhkhanh_qr_origin';
let qrNetworkInfo = null;
let qrNetworkInfoPromise = null;

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Auto-login nếu đã có token từ phiên trước
document.addEventListener('DOMContentLoaded', async () => {
    if (adminToken) {
        const savedUser = sessionStorage.getItem('adminUser') || 'Admin';
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('admin-app').classList.remove('hidden');
        document.querySelector('.admin-user').textContent = `👤 ${savedUser}`;
        await loadDashboardData();
    }
});

// ==================== LOGIN ====================

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');

    btn.disabled = true;
    btn.innerHTML = '<span class="material-icons-round">hourglass_top</span> Đang đăng nhập...';

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            let message = 'Sai tên đăng nhập hoặc mật khẩu';
            try {
                const err = await res.json();
                message = err.message || message;
            } catch {
                // Demo API có thể trả 401 không body.
            }
            alert(message);
            return;
        }

        const data = await res.json();
        adminToken = data.token;
        sessionStorage.setItem('adminToken', adminToken);
        sessionStorage.setItem('adminUser', data.username);

        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('admin-app').classList.remove('hidden');
        document.querySelector('.admin-user').textContent = `👤 ${data.username}`;

        // Load dashboard data
        await loadDashboardData();
    } catch (err) {
        alert('Lỗi kết nối: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-icons-round">login</span> Đăng nhập';
    }
});

function logout() {
    adminToken = '';
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    document.getElementById('admin-app').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
}

function authHeaders(extra = {}) {
    return {
        ...extra,
        Authorization: `Bearer ${adminToken}`
    };
}

async function apiFetch(url, options = {}) {
    const headers = authHeaders(options.headers || {});
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
        if (!apiFetch.authAlertShown) {
            apiFetch.authAlertShown = true;
            alert('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
            setTimeout(() => { apiFetch.authAlertShown = false; }, 1000);
        }
        logout();
        throw new Error('Unauthorized');
    }
    return res;
}

function getQrServerUrl(data, size) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}

function isLoopbackHost(hostname = window.location.hostname) {
    return ['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(hostname.toLowerCase());
}

function normalizeOrigin(origin) {
    const trimmed = String(origin || '').trim();
    if (!trimmed) return '';

    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
    try {
        const url = new URL(candidate);
        return url.origin;
    } catch {
        return '';
    }
}

async function getQrNetworkInfo() {
    if (qrNetworkInfo) return qrNetworkInfo;

    if (!qrNetworkInfoPromise) {
        qrNetworkInfoPromise = fetch('/api/system/network', { cache: 'no-store' })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                const lanOrigins = Array.isArray(data?.lanOrigins)
                    ? data.lanOrigins.map(normalizeOrigin).filter(Boolean)
                    : [];

                qrNetworkInfo = {
                    currentOrigin: normalizeOrigin(data?.currentOrigin || window.location.origin),
                    preferredOrigin: normalizeOrigin(data?.preferredOrigin || lanOrigins[0] || ''),
                    lanOrigins
                };
                return qrNetworkInfo;
            })
            .catch(error => {
                console.warn('Không lấy được IP LAN từ backend:', error);
                qrNetworkInfo = {
                    currentOrigin: window.location.origin,
                    preferredOrigin: '',
                    lanOrigins: []
                };
                return qrNetworkInfo;
            });
    }

    return qrNetworkInfoPromise;
}

function getNetworkLanOrigin() {
    const origin = normalizeOrigin(qrNetworkInfo?.preferredOrigin || qrNetworkInfo?.lanOrigins?.[0] || '');
    if (!origin) return '';

    try {
        return isLoopbackHost(new URL(origin).hostname) ? '' : origin;
    } catch {
        return '';
    }
}

function getQrAppOrigin() {
    const savedOrigin = normalizeOrigin(localStorage.getItem(QR_ORIGIN_KEY) || '');
    if (savedOrigin) return savedOrigin;

    const lanOrigin = getNetworkLanOrigin();
    if (isLoopbackHost() && lanOrigin) return lanOrigin;

    return window.location.origin;
}

function getSuggestedLanOrigin() {
    if (qrNetworkInfo?.lanOrigins?.length) {
        return qrNetworkInfo.lanOrigins.join(' hoặc ');
    }

    const port = window.location.port || '5000';
    return `http://<IP-LAN-của-máy>:${port}`;
}

function updateQrOriginPanel(appOrigin) {
    const input = document.getElementById('qr-origin-input');
    const suggest = document.getElementById('qr-origin-suggest');
    const panel = document.getElementById('qr-lan-warning');
    const status = document.getElementById('qr-origin-status');
    const savedOrigin = normalizeOrigin(localStorage.getItem(QR_ORIGIN_KEY) || '');
    const networkLanOrigin = getNetworkLanOrigin();

    if (input) input.value = appOrigin;
    if (suggest) suggest.textContent = getSuggestedLanOrigin();
    panel?.classList.remove('hidden');

    if (!status) return;

    if (savedOrigin) {
        status.textContent = `Đang dùng URL LAN bạn nhập thủ công: ${savedOrigin}`;
    } else if (isLoopbackHost() && networkLanOrigin) {
        status.textContent = `Admin đang mở bằng localhost, nhưng QR đã tự dùng IP LAN: ${networkLanOrigin}`;
    } else if (isLoopbackHost()) {
        status.textContent = 'Chưa lấy được IP LAN tự động. Nhập IP LAN của máy chạy demo để QR mở được trên điện thoại.';
    } else {
        status.textContent = `Admin đang mở bằng LAN/host thật, QR dùng origin hiện tại: ${appOrigin}`;
    }
}

async function renderQrForCurrentModal() {
    const modal = document.getElementById('qr-view-modal');
    const qrCode = modal.dataset.qrCode;
    if (!qrCode) return;

    const appOrigin = getQrAppOrigin();
    const appUrl = `${appOrigin}/index.html?qr=${encodeURIComponent(qrCode)}`;
    document.getElementById('qr-poi-code').textContent = 'Đường dẫn: ' + appUrl;
    modal.dataset.qrUrl = appUrl;
    updateQrOriginPanel(appOrigin);
    await renderQr(document.getElementById('qr-image-container'), appUrl, 300);
}

async function saveQrOriginOverride() {
    const input = document.getElementById('qr-origin-input');
    const origin = normalizeOrigin(input?.value || '');
    if (!origin) {
        alert('URL LAN không hợp lệ. Ví dụ: http://192.168.1.20:5000');
        return;
    }
    localStorage.setItem(QR_ORIGIN_KEY, origin);
    await renderQrForCurrentModal();
}

async function clearQrOriginOverride() {
    localStorage.removeItem(QR_ORIGIN_KEY);
    await renderQrForCurrentModal();
}

async function renderQr(container, data, size = 300) {
    container.innerHTML = '';
    const img = document.createElement('img');
    img.alt = 'QR Code';
    img.style.width = '250px';
    img.style.height = '250px';
    img.style.display = 'block';
    img.style.margin = '0 auto';

    try {
        if (window.QRCode?.toDataURL) {
            img.src = await window.QRCode.toDataURL(data, {
                width: size,
                margin: 1,
                errorCorrectionLevel: 'M'
            });
        } else {
            img.src = getQrServerUrl(data, size);
        }
    } catch (error) {
        console.warn('Không tạo QR local được, fallback QR server:', error);
        img.src = getQrServerUrl(data, size);
    }

    img.onerror = () => {
        container.innerHTML = `<p style="color:#111;max-width:260px;word-break:break-all;">${data}</p>`;
    };
    container.appendChild(img);
}

// ==================== PAGE NAVIGATION ====================

function switchPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById(`page-${page}`).classList.add('active');
    document.querySelector(`.nav-item[data-page="${page}"]`).classList.add('active');

    const titles = {
        dashboard: 'Dashboard',
        pois: 'Quản lý POI',
        tours: 'Quản lý Tour',
        analytics: 'Phân tích dữ liệu',
        translations: 'Bản dịch'
    };
    document.getElementById('page-title').textContent = titles[page] || page;

    // Load page data
    if (page === 'pois') loadPoisTable();
    if (page === 'tours') loadTours();
    if (page === 'analytics') loadAnalyticsDetail();
    if (page === 'translations') loadTranslations();
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// ==================== DASHBOARD ====================

async function loadDashboardData() {
    try {
        // Load stats
        const [statsRes, topPoisRes, recentRes, poisRes] = await Promise.all([
            apiFetch('/api/analytics/stats'),
            apiFetch('/api/analytics/top-pois'),
            apiFetch('/api/analytics/recent?limit=20'),
            apiFetch('/api/poi/all')
        ]);

        const stats = await statsRes.json();
        const topPois = await topPoisRes.json();
        const recentEvents = await recentRes.json();
        adminPois = await poisRes.json();
        adminPois = adminPois.map(p => ({ ...p, id: p.id || p._id }));

        // Update stat cards
        document.getElementById('stat-pois').textContent = adminPois.length;
        document.getElementById('stat-sessions').textContent = stats.uniqueSessions || 0;
        document.getElementById('stat-listens').textContent = stats.eventCounts?.poi_listen || 0;
        document.getElementById('stat-qr').textContent = stats.eventCounts?.qr_scan || 0;

        // Render top POIs chart
        renderTopPoisChart(topPois);

        // Render recent events
        renderRecentEvents(recentEvents);

        // Init heatmap
        initHeatmap();
    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

function renderTopPoisChart(topPois) {
    const container = document.getElementById('top-pois-chart');
    if (topPois.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">Chưa có dữ liệu</p>';
        return;
    }

    const maxCount = Math.max(...topPois.map(p => p.listenCount));

    container.innerHTML = `<div class="bar-chart">${topPois.map(p => {
        const poi = adminPois.find(ap => ap.id === p.poiId);
        const name = poi?.name?.vi || p.poiId;
        const pct = (p.listenCount / maxCount * 100);
        return `
            <div class="bar-item">
                <div class="bar-label">${name}</div>
                <div class="bar-fill-container">
                    <div class="bar-fill" style="width: ${pct}%">${p.listenCount}</div>
                </div>
            </div>
        `;
    }).join('')}</div>`;
}

function renderRecentEvents(events) {
    const container = document.getElementById('recent-events');
    if (events.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">Chưa có hoạt động</p>';
        return;
    }

    const typeLabels = {
        'poi_enter': '📍 Vào vùng',
        'poi_listen': '🎧 Nghe',
        'poi_complete': '✅ Hoàn thành',
        'qr_scan': '📱 Quét QR',
        'location_update': '📡 Vị trí'
    };

    container.innerHTML = events.slice(0, 15).map(e => {
        const time = new Date(e.timestamp).toLocaleString('vi-VN');
        const poi = adminPois.find(p => p.id === e.poiId);
        const poiName = poi?.name?.vi || '';
        return `
            <div class="event-item">
                <span class="event-type">${typeLabels[e.eventType] || e.eventType}</span>
                <span>${poiName}</span>
                <span class="event-time">${time}</span>
            </div>
        `;
    }).join('');
}

async function initHeatmap() {
    const container = document.getElementById('heatmap-container');

    if (!heatmapMap) {
        heatmapMap = L.map(container, {
            center: [10.7570, 106.6950],
            zoom: 16
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(heatmapMap);
    }

    // Add POI markers
    adminPois.forEach(poi => {
        L.circleMarker([poi.latitude, poi.longitude], {
            radius: 8,
            color: '#FF6B35',
            fillColor: '#FF6B35',
            fillOpacity: 0.7
        }).bindTooltip(poi.name?.vi || 'POI').addTo(heatmapMap);
    });

    // Load and display heatmap data
    try {
        const res = await apiFetch('/api/analytics/heatmap');
        const points = await res.json();

        points.forEach(p => {
            L.circle([p.latitude, p.longitude], {
                radius: 15 + p.intensity * 5,
                color: 'rgba(255, 107, 53, 0.4)',
                fillColor: 'rgba(255, 107, 53, 0.2)',
                fillOpacity: 0.6,
                weight: 0
            }).addTo(heatmapMap);
        });
    } catch (e) {
        // No heatmap data yet
    }

    setTimeout(() => heatmapMap.invalidateSize(), 100);
}

// ==================== POI MANAGEMENT ====================

async function loadPoisTable() {
    try {
        const [poisRes, topPoisRes] = await Promise.all([
            apiFetch('/api/poi/all'),
            apiFetch('/api/analytics/top-pois?limit=50')
        ]);
        adminPois = await poisRes.json();
        adminPois = adminPois.map(p => ({ ...p, id: p.id || p._id }));

        // Gắn lượt nghe thực tế từ analytics
        let listenMap = new Map();
        try {
            const topPois = await topPoisRes.json();
            listenMap = new Map(topPois.map(tp => [tp.poiId, tp.listenCount || 0]));
        } catch { }
        adminPois.forEach(p => { p.listenCount = listenMap.get(p.id) || 0; });

        // Tính thứ hạng ưu tiên theo lượt nghe (nhiều nhất = hạng 1)
        const sorted = [...adminPois].sort((a, b) => b.listenCount - a.listenCount);
        const rankMap = new Map();
        sorted.forEach((p, i) => rankMap.set(p.id, i + 1));

        const tbody = document.getElementById('poi-table-body');
        const categoryColors = {
            seafood: '#00BCD4', hotpot: '#FF5722', snack: '#E91E63',
            street_food: '#FF9800', landmark: '#9C27B0'
        };
        const rankBadge = (rank) => {
            if (rank === 1) return '🥇 1';
            if (rank === 2) return '🥈 2';
            if (rank === 3) return '🥉 3';
            return `#${rank}`;
        };

        tbody.innerHTML = adminPois.map(poi => {
            const rank = rankMap.get(poi.id);
            return `
            <tr>
                <td><strong>${poi.name?.vi || '—'}</strong></td>
                <td><span class="category-badge" style="background: ${categoryColors[poi.category]}20; color: ${categoryColors[poi.category]}">${poi.category}</span></td>
                <td style="font-size: 12px; color: var(--text-muted)">${poi.latitude?.toFixed(4)}, ${poi.longitude?.toFixed(4)}</td>
                <td>${poi.radius}m</td>
                <td><span style="font-weight: 600; color: ${rank <= 3 ? 'var(--primary)' : 'var(--text-muted)'}" title="🎧 ${poi.listenCount} lượt nghe">${rankBadge(rank)}</span></td>
                <td><span class="status-badge ${poi.isActive ? 'active' : 'inactive'}">${poi.isActive ? 'Hoạt động' : 'Ẩn'}</span></td>
                <td class="actions">
                    <button class="btn btn-primary btn-sm" onclick="viewQr('${poi.id}')" title="Hiển thị mã QR">
                        <span class="material-icons-round" style="font-size: 16px">qr_code_2</span>
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="editPoi('${poi.id}')" title="Sửa">
                        <span class="material-icons-round" style="font-size: 16px">edit</span>
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="togglePoiStatus('${poi.id}')" title="${poi.isActive ? 'Khóa (Ẩn)' : 'Mở khóa (Hiện)'}">
                        <span class="material-icons-round" style="font-size: 16px; color: ${poi.isActive ? 'var(--warning)' : 'var(--success)'}">${poi.isActive ? 'lock' : 'lock_open'}</span>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deletePoi('${poi.id}')" title="Xóa">
                        <span class="material-icons-round" style="font-size: 16px">delete</span>
                    </button>
                </td>
            </tr>
        `}).join('');
    } catch (err) {
        console.error('Load POIs error:', err);
    }
}

function openPoiModal(poi = null) {
    document.getElementById('poi-modal').classList.remove('hidden');
    document.getElementById('poi-modal-title').textContent = poi ? 'Sửa POI' : 'Thêm POI mới';

    if (poi) {
        document.getElementById('poi-edit-id').value = poi.id;
        document.getElementById('poi-name-vi').value = poi.name?.vi || '';
        document.getElementById('poi-name-en').value = poi.name?.en || '';
        document.getElementById('poi-lat').value = poi.latitude;
        document.getElementById('poi-lng').value = poi.longitude;
        document.getElementById('poi-radius').value = poi.radius;
        document.getElementById('poi-priority').value = poi.priority;
        document.getElementById('poi-category').value = poi.category;
        document.getElementById('poi-qrcode').value = poi.qrCode || '';
        document.getElementById('poi-address').value = poi.address || '';
        document.getElementById('poi-hours').value = poi.openingHours || '';
        document.getElementById('poi-price').value = poi.priceRange || '';
        document.getElementById('poi-desc-vi').value = poi.description?.vi || '';
        document.getElementById('poi-desc-en').value = poi.description?.en || '';
        document.getElementById('poi-tts-vi').value = poi.ttsScript?.vi || '';
        document.getElementById('poi-tts-en').value = poi.ttsScript?.en || '';
    } else {
        document.getElementById('poi-form').reset();
        document.getElementById('poi-edit-id').value = '';
        document.getElementById('poi-radius').value = 50;
        document.getElementById('poi-priority').value = 5;
        // Tự sinh mã QR: VK-POI-XXX
        document.getElementById('poi-qrcode').value = `VK-POI-${String(Date.now()).slice(-4)}${String(Math.floor(Math.random() * 900) + 100)}`;
    }

    // QR là readonly — admin không cần nhập tay
    document.getElementById('poi-qrcode').readOnly = true;
}

function closePoiModal() {
    document.getElementById('poi-modal').classList.add('hidden');
}

function editPoi(poiId) {
    const poi = adminPois.find(p => p.id === poiId);
    if (poi) openPoiModal(poi);
}

async function savePoi(e) {
    e.preventDefault();

    const editId = document.getElementById('poi-edit-id').value;
    const poi = {
        name: {
            vi: document.getElementById('poi-name-vi').value,
            en: document.getElementById('poi-name-en').value
        },
        description: {
            vi: document.getElementById('poi-desc-vi').value,
            en: document.getElementById('poi-desc-en').value
        },
        ttsScript: {
            vi: document.getElementById('poi-tts-vi').value,
            en: document.getElementById('poi-tts-en').value
        },
        latitude: parseFloat(document.getElementById('poi-lat').value),
        longitude: parseFloat(document.getElementById('poi-lng').value),
        radius: parseInt(document.getElementById('poi-radius').value),
        priority: parseInt(document.getElementById('poi-priority').value),
        category: document.getElementById('poi-category').value,
        qrCode: document.getElementById('poi-qrcode').value,
        address: document.getElementById('poi-address').value,
        openingHours: document.getElementById('poi-hours').value,
        priceRange: document.getElementById('poi-price').value,
        isActive: editId ? (adminPois.find(p => p.id === editId)?.isActive ?? true) : true
    };

    try {
        const url = editId ? `/api/poi/${editId}` : '/api/poi';
        const method = editId ? 'PUT' : 'POST';

        const res = await apiFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(poi)
        });

        if (res.ok || res.status === 204) {
            closePoiModal();
            loadPoisTable();
            alert(editId ? 'Đã cập nhật POI!' : 'Đã thêm POI mới!');
        } else {
            alert('Lỗi khi lưu POI');
        }
    } catch (err) {
        alert('Lỗi: ' + err.message);
    }
}

async function deletePoi(poiId) {
    if (!confirm('Bạn có chắc muốn xóa POI này?')) return;

    try {
        const res = await apiFetch(`/api/poi/${poiId}`, { method: 'DELETE' });
        if (res.ok || res.status === 204) {
            loadPoisTable();
            alert('Đã xóa POI!');
        }
    } catch (err) {
        alert('Lỗi: ' + err.message);
    }
}

async function togglePoiStatus(poiId) {
    const poi = adminPois.find(p => p.id === poiId);
    if (!poi) return;

    const actionText = poi.isActive ? 'khóa (ẩn)' : 'mở khóa (hiện)';
    if (!confirm(`Bạn có chắc muốn ${actionText} điểm thuyết minh "${poi.name?.vi || poiId}" không?`)) return;

    // Toggle trạng thái — loại bỏ field client-only (listenCount) trước khi gửi lên server
    const { listenCount, ...cleanPoi } = poi;
    const updatedPoi = { ...cleanPoi, isActive: !poi.isActive };

    try {
        const res = await apiFetch(`/api/poi/${poiId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedPoi)
        });

        if (res.ok || res.status === 204) {
            await loadPoisTable();
            alert(`Đã ${actionText} POI thành công!`);
        } else {
            const errText = await res.text().catch(() => '');
            alert(`Lỗi khi cập nhật trạng thái POI: ${res.status} ${errText}`);
        }
    } catch (err) {
        alert('Lỗi: ' + err.message);
    }
}

// ==================== TOURS ====================

async function loadTours() {
    try {
        const res = await apiFetch('/api/tour');
        adminTours = await res.json();
        adminTours = adminTours.map(t => ({ ...t, id: t.id || t._id }));

        const container = document.getElementById('tours-list');

        if (adminTours.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">Chưa có tour nào</p>';
            return;
        }

        container.innerHTML = adminTours.map(tour => `
            <div class="tour-card">
                <h3>${tour.name?.vi || 'Tour'}</h3>
                <div class="tour-meta">
                    <p>📍 ${tour.poiIds?.length || 0} điểm thuyết minh</p>
                    <p>⏱️ ${tour.estimatedDuration || 0} phút</p>
                    <p>📏 ${tour.estimatedDistance || 0} km</p>
                </div>
                <div style="margin-top: 12px; display: flex; gap: 8px;">
                    <button class="btn btn-danger btn-sm" onclick="deleteTour('${tour.id}')">
                        <span class="material-icons-round" style="font-size: 14px">delete</span> Xóa
                    </button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Load tours error:', err);
    }
}

function openTourModal() {
    alert('Chức năng thêm tour sẽ được cập nhật trong phiên bản tiếp theo.');
}

async function deleteTour(tourId) {
    if (!confirm('Xóa tour này?')) return;
    try {
        await apiFetch(`/api/tour/${tourId}`, { method: 'DELETE' });
        loadTours();
    } catch (e) { }
}

// ==================== ANALYTICS ====================

async function loadAnalyticsDetail() {
    try {
        const [statsRes, topPoisRes] = await Promise.all([
            apiFetch('/api/analytics/stats'),
            apiFetch('/api/analytics/top-pois?limit=20')
        ]);

        const stats = await statsRes.json();
        const topPois = await topPoisRes.json();

        // Stats detail
        const detailEl = document.getElementById('analytics-detail');
        const counts = stats.eventCounts || {};
        detailEl.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(255,107,53,0.15); color: #FF6B35;">
                    <span class="material-icons-round">place</span>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${counts.poi_enter || 0}</div>
                    <div class="stat-label">Lượt vào vùng</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(33,150,243,0.15); color: #2196F3;">
                    <span class="material-icons-round">headphones</span>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${counts.poi_listen || 0}</div>
                    <div class="stat-label">Lượt nghe</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(76,175,80,0.15); color: #4CAF50;">
                    <span class="material-icons-round">people</span>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${stats.uniqueSessions || 0}</div>
                    <div class="stat-label">Phiên unique</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(156,39,176,0.15); color: #9C27B0;">
                    <span class="material-icons-round">qr_code</span>
                </div>
                <div class="stat-info">
                    <div class="stat-value">${counts.qr_scan || 0}</div>
                    <div class="stat-label">Lượt quét QR</div>
                </div>
            </div>
        `;

        // POI ranking
        const rankingEl = document.getElementById('poi-ranking');
        if (topPois.length === 0) {
            rankingEl.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">Chưa có dữ liệu</p>';
        } else {
            rankingEl.innerHTML = `<div class="ranking-list">${topPois.map(p => {
                const poi = adminPois.find(ap => ap.id === p.poiId);
                const name = poi?.name?.vi || p.poiId;
                return `
                    <div class="ranking-item">
                        <span class="ranking-name">${name}</span>
                        <span class="ranking-value">${p.listenCount} lượt · ${p.avgDuration?.toFixed(1) || 0}s TB</span>
                    </div>
                `;
            }).join('')}</div>`;
        }
    } catch (err) {
        console.error('Analytics error:', err);
    }
}

// ==================== TRANSLATIONS ====================

async function loadTranslations() {
    const container = document.getElementById('translations-list');

    if (adminPois.length === 0) {
        try {
            const res = await apiFetch('/api/poi/all');
            adminPois = await res.json();
            adminPois = adminPois.map(p => ({ ...p, id: p.id || p._id }));
        } catch (e) { }
    }

    container.innerHTML = adminPois.map(poi => {
        const langs = ['vi', 'en', 'ja', 'zh', 'ko', 'th', 'fr', 'es', 'de', 'ru', 'pt', 'it', 'id', 'hi', 'ar', 'ms', 'tl', 'nl', 'sv', 'pl'];
        const langNames = {
            vi: '🇻🇳 VI', en: '🇺🇸 EN', ja: '🇯🇵 JP', zh: '🇨🇳 ZH',
            ko: '🇰🇷 KO', th: '🇹🇭 TH', fr: '🇫🇷 FR', es: '🇪🇸 ES',
            de: '🇩🇪 DE', ru: '🇷🇺 RU', pt: '🇧🇷 PT', it: '🇮🇹 IT',
            id: '🇮🇩 ID', hi: '🇮🇳 HI', ar: '🇸🇦 AR', ms: '🇲🇾 MS',
            tl: '🇵🇭 TL', nl: '🇳🇱 NL', sv: '🇸🇪 SV', pl: '🇵🇱 PL'
        };

        // Phân tích trạng thái: VI/EN là nguồn chính; ngôn ngữ khác dịch runtime.
        const coreLangs = ['vi', 'en']; // Admin chỉ nhập VI + EN, còn lại dịch tự động
        const nameValue = (lang) => {
            if (coreLangs.includes(lang)) {
                return poi.name?.[lang]
                    ? escapeHtml(poi.name[lang])
                    : '<em style="color:var(--danger)">Chưa nhập nguồn</em>';
            }
            return poi.name?.[lang]
                ? '<em style="color:var(--warning)">Có seed/fallback, không bắt buộc nhập</em>'
                : '<em style="color:var(--info)">🤖 Dịch tự động khi du khách chọn</em>';
        };
        const ttsValue = (lang) => {
            if (coreLangs.includes(lang)) {
                return poi.ttsScript?.[lang]
                    ? '✅ Có nguồn'
                    : '<em style="color:var(--warning)">Chưa có nguồn</em>';
            }
            return poi.ttsScript?.[lang]
                ? '<em style="color:var(--warning)">Có seed/fallback, app vẫn ưu tiên VI/EN</em>'
                : '<em style="color:var(--info)">🤖 Dịch tự động khi du khách chọn</em>';
        };

        return `
            <div class="translation-item">
                <h4>📍 ${escapeHtml(poi.name?.vi || poi.name?.en || 'POI')}</h4>
                <p style="font-size:12px;color:var(--text-muted);margin:4px 0 12px;">
                    Admin chỉ cần nhập <strong>VI hoặc EN</strong>. Các ngôn ngữ khác không lưu bắt buộc trong DB; app dịch runtime và cache ở client.
                </p>
                <div style="margin-bottom: 8px;"><strong style="font-size: 12px; color: var(--text-muted);">Tên:</strong></div>
                ${langs.map(l => `
                    <div class="translation-lang">
                        <span class="translation-lang-code">${langNames[l]}</span>
                        <span class="translation-lang-text">${nameValue(l)}</span>
                    </div>
                `).join('')}
                <div style="margin: 12px 0 8px;"><strong style="font-size: 12px; color: var(--text-muted);">Script TTS:</strong></div>
                ${langs.map(l => `
                    <div class="translation-lang">
                        <span class="translation-lang-code">${langNames[l]}</span>
                        <span class="translation-lang-text">${ttsValue(l)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

// ==================== QR VIEWER ====================

async function viewQr(poiId) {
    const poi = adminPois.find(p => p.id === poiId);
    if (!poi) return;
    await getQrNetworkInfo();

    // Mã QR encode URL đầy đủ: khi quét bằng camera sẽ mở app và tự phát thuyết minh
    const qrCode = poi.qrCode || poi.id;
    const name = poi.name?.vi || 'Điểm Thuyết Minh';
    const modal = document.getElementById('qr-view-modal');

    document.getElementById('qr-poi-name').textContent = name;

    // Lưu để dùng khi in
    modal.dataset.poiName = name;
    modal.dataset.qrCode = qrCode;
    modal.classList.remove('hidden');

    await renderQrForCurrentModal();
}

function closeQrViewModal() {
    document.getElementById('qr-view-modal').classList.add('hidden');
}

function printQr() {
    const container = document.getElementById('qr-image-container').innerHTML;
    const name = document.getElementById('qr-poi-name').textContent;
    const code = document.getElementById('qr-poi-code').textContent;

    const printWindow = window.open('', '', 'height=600,width=800');
    // Mở một cửa sổ mới để in
    printWindow.document.write('<html><head><title>In QR Code</title>');
    printWindow.document.write('<style>body { font-family: sans-serif; text-align: center; padding: 40px; } img { width: 300px; height: 300px; margin: 20px auto; } h1 { font-size: 28px; margin-bottom: 20px; color: #333; } p { font-size: 18px; color: #666; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<h1>Phố Ẩm Thực Vĩnh Khánh</h1>`);
    printWindow.document.write(`<h2 style="font-size: 24px; color: #FF6B35;">${name}</h2>`);
    printWindow.document.write(container);
    printWindow.document.write(`<p style="font-weight: bold; color: #000;">${code}</p>`);
    printWindow.document.write('<p>Quét mã này bằng ứng dụng <br><strong>Vĩnh Khánh Food Tour</strong> để nghe thuyết minh.</p>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();

    // Đợi ảnh load xong mới in
    printWindow.setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 1000);
}
