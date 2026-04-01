/**
 * Map Manager - Quản lý bản đồ Leaflet
 * Hiển thị POI, user location, geofence circles
 */
class MapManager {
    constructor(containerId) {
        this.containerId = containerId;
        this.map = null;
        this.poiMarkers = {};
        this.geofenceCircles = {};
        this.userMarker = null;
        this.userAccuracyCircle = null;
        this.closestPoiId = null;
        this.onPoiClick = null;

        // Vĩnh Khánh center coordinates
        this.defaultCenter = [10.7570, 106.6950];
        this.defaultZoom = 17;

        // Category icons
        this.categoryEmoji = {
            'seafood': '🦐',
            'hotpot': '🍲',
            'snack': '🧁',
            'street_food': '🍜',
            'landmark': '🏛️'
        };
    }

    /**
     * Khởi tạo bản đồ
     */
    init() {
        this.map = L.map(this.containerId, {
            center: this.defaultCenter,
            zoom: this.defaultZoom,
            zoomControl: false,
            attributionControl: false
        });

        // OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(this.map);

        // Add attribution ở góc
        L.control.attribution({ position: 'bottomleft' }).addTo(this.map);

        return this;
    }

    /**
     * Thêm tất cả POI markers lên bản đồ
     */
    addPois(pois, lang = 'vi') {
        pois.forEach(poi => {
            this.addPoiMarker(poi, lang);
            this.addGeofenceCircle(poi);
        });
    }

    /**
     * Thêm marker cho 1 POI
     */
    addPoiMarker(poi, lang = 'vi') {
        const emoji = this.categoryEmoji[poi.category] || '📍';
        const name = poi.name[lang] || poi.name['vi'] || 'Không tên';

        const icon = L.divIcon({
            className: 'custom-marker-wrapper',
            html: `<div class="custom-marker ${poi.category}" data-poi-id="${poi.id}">${emoji}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });

        const marker = L.marker([poi.latitude, poi.longitude], { icon })
            .addTo(this.map);

        // Click event
        marker.on('click', () => {
            if (this.onPoiClick) {
                this.onPoiClick(poi);
            }
        });

        // Tooltip
        marker.bindTooltip(name, {
            direction: 'top',
            offset: [0, -20],
            className: 'poi-tooltip'
        });

        this.poiMarkers[poi.id] = marker;
    }

    /**
     * Vẽ vòng tròn geofence cho POI
     */
    addGeofenceCircle(poi) {
        const circle = L.circle([poi.latitude, poi.longitude], {
            radius: poi.radius,
            className: 'geofence-circle',
            color: 'rgba(255, 107, 53, 0.3)',
            fillColor: 'rgba(255, 107, 53, 0.08)',
            fillOpacity: 0.5,
            weight: 1,
            dashArray: '5, 5'
        }).addTo(this.map);

        this.geofenceCircles[poi.id] = circle;
    }

    /**
     * Cập nhật vị trí người dùng trên bản đồ
     */
    updateUserLocation(lat, lng, accuracy) {
        const latlng = [lat, lng];

        if (!this.userMarker) {
            // Tạo user marker
            const pulseIcon = L.divIcon({
                className: 'user-marker-wrapper',
                html: `<div class="user-marker-pulse"></div><div class="user-marker"></div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });

            this.userMarker = L.marker(latlng, { 
                icon: pulseIcon,
                zIndexOffset: 1000 
            }).addTo(this.map);

            // Accuracy circle
            this.userAccuracyCircle = L.circle(latlng, {
                radius: accuracy,
                color: 'rgba(66, 133, 244, 0.2)',
                fillColor: 'rgba(66, 133, 244, 0.1)',
                fillOpacity: 0.5,
                weight: 1
            }).addTo(this.map);
        } else {
            this.userMarker.setLatLng(latlng);
            this.userAccuracyCircle.setLatLng(latlng);
            this.userAccuracyCircle.setRadius(accuracy);
        }
    }

    /**
     * Center bản đồ vào vị trí người dùng
     */
    centerOnUser() {
        if (this.userMarker) {
            this.map.setView(this.userMarker.getLatLng(), 17, { animate: true });
        }
    }

    /**
     * Center vào POI
     */
    centerOnPoi(poiId) {
        const marker = this.poiMarkers[poiId];
        if (marker) {
            this.map.setView(marker.getLatLng(), 18, { animate: true });
        }
    }

    /**
     * Highlight POI gần nhất
     */
    highlightClosest(poiId) {
        // Remove highlight cũ
        if (this.closestPoiId && this.poiMarkers[this.closestPoiId]) {
            const oldEl = document.querySelector(`.custom-marker[data-poi-id="${this.closestPoiId}"]`);
            if (oldEl) oldEl.classList.remove('closest');
        }

        // Add highlight mới
        this.closestPoiId = poiId;
        if (poiId) {
            const el = document.querySelector(`.custom-marker[data-poi-id="${poiId}"]`);
            if (el) el.classList.add('closest');
        }
    }

    /**
     * Set active marker (đang xem chi tiết)
     */
    setActiveMarker(poiId) {
        // Clear all active
        document.querySelectorAll('.custom-marker.active').forEach(el => {
            el.classList.remove('active');
        });

        if (poiId) {
            const el = document.querySelector(`.custom-marker[data-poi-id="${poiId}"]`);
            if (el) el.classList.add('active');
        }
    }

    /**
     * Cập nhật labels khi đổi ngôn ngữ
     */
    updateLanguage(pois, lang) {
        pois.forEach(poi => {
            const marker = this.poiMarkers[poi.id];
            if (marker) {
                const name = poi.name[lang] || poi.name['vi'] || '';
                marker.unbindTooltip();
                marker.bindTooltip(name, {
                    direction: 'top',
                    offset: [0, -20],
                    className: 'poi-tooltip'
                });
            }
        });
    }
}

// Export global
window.MapManager = MapManager;
