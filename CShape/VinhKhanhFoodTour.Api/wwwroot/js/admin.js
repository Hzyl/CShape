/**
 * Admin CMS JavaScript
 * Quản lý POI, Tour, Analytics, Translations
 */

let adminToken = '';
let adminPois = [];
let adminTours = [];
let heatmapMap = null;

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
            const err = await res.json();
            alert(err.message || 'Sai tên đăng nhập hoặc mật khẩu');
            return;
        }

        const data = await res.json();
        adminToken = data.token;
        
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
    document.getElementById('admin-app').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
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
            fetch('/api/analytics/stats'),
            fetch('/api/analytics/top-pois'),
            fetch('/api/analytics/recent?limit=20'),
            fetch('/api/poi/all')
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
        const res = await fetch('/api/analytics/heatmap');
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
        const res = await fetch('/api/poi/all');
        adminPois = await res.json();
        adminPois = adminPois.map(p => ({ ...p, id: p.id || p._id }));

        const tbody = document.getElementById('poi-table-body');
        const categoryColors = {
            seafood: '#00BCD4', hotpot: '#FF5722', snack: '#E91E63',
            street_food: '#FF9800', landmark: '#9C27B0'
        };

        tbody.innerHTML = adminPois.map(poi => `
            <tr>
                <td><strong>${poi.name?.vi || '—'}</strong></td>
                <td><span class="category-badge" style="background: ${categoryColors[poi.category]}20; color: ${categoryColors[poi.category]}">${poi.category}</span></td>
                <td style="font-size: 12px; color: var(--text-muted)">${poi.latitude?.toFixed(4)}, ${poi.longitude?.toFixed(4)}</td>
                <td>${poi.radius}m</td>
                <td>${poi.priority}</td>
                <td><span class="status-badge ${poi.isActive ? 'active' : 'inactive'}">${poi.isActive ? 'Hoạt động' : 'Ẩn'}</span></td>
                <td class="actions">
                    <button class="btn btn-ghost btn-sm" onclick="editPoi('${poi.id}')">
                        <span class="material-icons-round" style="font-size: 16px">edit</span>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deletePoi('${poi.id}')">
                        <span class="material-icons-round" style="font-size: 16px">delete</span>
                    </button>
                </td>
            </tr>
        `).join('');
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
        document.getElementById('poi-name-ja').value = poi.name?.ja || '';
        document.getElementById('poi-name-zh').value = poi.name?.zh || '';
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
    }
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
            en: document.getElementById('poi-name-en').value,
            ja: document.getElementById('poi-name-ja').value,
            zh: document.getElementById('poi-name-zh').value
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
        isActive: true
    };

    try {
        const url = editId ? `/api/poi/${editId}` : '/api/poi';
        const method = editId ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
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
        const res = await fetch(`/api/poi/${poiId}`, { method: 'DELETE' });
        if (res.ok || res.status === 204) {
            loadPoisTable();
            alert('Đã xóa POI!');
        }
    } catch (err) {
        alert('Lỗi: ' + err.message);
    }
}

// ==================== TOURS ====================

async function loadTours() {
    try {
        const res = await fetch('/api/tour');
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
        await fetch(`/api/tour/${tourId}`, { method: 'DELETE' });
        loadTours();
    } catch (e) {}
}

// ==================== ANALYTICS ====================

async function loadAnalyticsDetail() {
    try {
        const [statsRes, topPoisRes] = await Promise.all([
            fetch('/api/analytics/stats'),
            fetch('/api/analytics/top-pois?limit=20')
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
            const res = await fetch('/api/poi/all');
            adminPois = await res.json();
            adminPois = adminPois.map(p => ({ ...p, id: p.id || p._id }));
        } catch (e) {}
    }

    container.innerHTML = adminPois.map(poi => {
        const langs = ['vi', 'en', 'ja', 'zh'];
        const langNames = { vi: '🇻🇳 VI', en: '🇺🇸 EN', ja: '🇯🇵 JP', zh: '🇨🇳 ZH' };
        
        return `
            <div class="translation-item">
                <h4>📍 ${poi.name?.vi || 'POI'}</h4>
                <div style="margin-bottom: 8px;"><strong style="font-size: 12px; color: var(--text-muted);">Tên:</strong></div>
                ${langs.map(l => `
                    <div class="translation-lang">
                        <span class="translation-lang-code">${langNames[l]}</span>
                        <span class="translation-lang-text">${poi.name?.[l] || '<em style="color:var(--danger)">Chưa dịch</em>'}</span>
                    </div>
                `).join('')}
                <div style="margin: 12px 0 8px;"><strong style="font-size: 12px; color: var(--text-muted);">Script TTS:</strong></div>
                ${langs.map(l => `
                    <div class="translation-lang">
                        <span class="translation-lang-code">${langNames[l]}</span>
                        <span class="translation-lang-text">${poi.ttsScript?.[l] ? '✅ Có' : '<em style="color:var(--warning)">Chưa có</em>'}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}
