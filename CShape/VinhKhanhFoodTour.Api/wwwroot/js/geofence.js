/**
 * Geofence Manager - GPS tracking + Geofence trigger
 * Theo dõi vị trí người dùng và kích hoạt thuyết minh khi vào vùng POI
 */
class GeofenceManager {
    constructor() {
        this.watchId = null;
        this.currentPosition = null;
        this.pois = [];
        this.enteredPois = new Set(); // POIs user đang ở trong vùng
        this.cooldownMap = new Map(); // Cooldown để chống spam
        this.cooldownDuration = 30000; // 30s cooldown
        
        // Callbacks
        this.onLocationUpdate = null;
        this.onPoiEnter = null;
        this.onPoiExit = null;
        this.onClosestPoi = null;
        this.onError = null;
        this.onStatusChange = null;

        // Config
        this.isTracking = false;
        this.highAccuracy = true;
        this.updateInterval = 3000; // ms
    }

    /**
     * Cấu hình danh sách POI để theo dõi
     */
    setPois(pois) {
        this.pois = pois.map(p => ({
            id: p.id,
            lat: p.latitude,
            lng: p.longitude,
            radius: p.radius,
            priority: p.priority,
            name: p.name
        }));
    }

    /**
     * Bắt đầu theo dõi GPS
     */
    startTracking() {
        if (!navigator.geolocation) {
            this._notifyError('Trình duyệt không hỗ trợ GPS');
            return false;
        }

        this.isTracking = true;
        this._notifyStatus('tracking');

        const options = {
            enableHighAccuracy: this.highAccuracy,
            timeout: 10000,
            maximumAge: this.updateInterval
        };

        this.watchId = navigator.geolocation.watchPosition(
            (position) => this._onPositionUpdate(position),
            (error) => this._onPositionError(error),
            options
        );

        return true;
    }

    /**
     * Dừng theo dõi GPS
     */
    stopTracking() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        this.isTracking = false;
        this._notifyStatus('stopped');
    }

    /**
     * Xử lý khi có vị trí mới
     */
    _onPositionUpdate(position) {
        const { latitude, longitude, accuracy } = position.coords;
        this.currentPosition = { lat: latitude, lng: longitude, accuracy };

        // Thông báo vị trí mới
        if (this.onLocationUpdate) {
            this.onLocationUpdate(latitude, longitude, accuracy);
        }

        this._notifyStatus('active');

        // Kiểm tra geofence
        this._checkGeofences(latitude, longitude);

        // Tìm POI gần nhất
        this._findClosestPoi(latitude, longitude);

        // Track analytics (giới hạn tần suất)
        this._trackLocation(latitude, longitude);
    }

    /**
     * Kiểm tra user đã vào/ra vùng geofence chưa
     */
    _checkGeofences(lat, lng) {
        this.pois.forEach(poi => {
            const distance = this._calculateDistance(lat, lng, poi.lat, poi.lng);
            const isInside = distance <= poi.radius;
            const wasInside = this.enteredPois.has(poi.id);

            if (isInside && !wasInside) {
                // User VỪA ĐI VÀO vùng geofence
                this.enteredPois.add(poi.id);
                
                // Kiểm tra cooldown
                if (!this._isInCooldown(poi.id)) {
                    this.cooldownMap.set(poi.id, Date.now());
                    
                    if (this.onPoiEnter) {
                        this.onPoiEnter(poi, distance);
                    }
                }
            } else if (!isInside && wasInside) {
                // User VỪA ĐI RA khỏi vùng geofence
                this.enteredPois.delete(poi.id);
                
                if (this.onPoiExit) {
                    this.onPoiExit(poi);
                }
            }
        });
    }

    /**
     * Tìm POI gần nhất
     */
    _findClosestPoi(lat, lng) {
        let closest = null;
        let minDistance = Infinity;

        this.pois.forEach(poi => {
            const distance = this._calculateDistance(lat, lng, poi.lat, poi.lng);
            if (distance < minDistance) {
                minDistance = distance;
                closest = { ...poi, distance };
            }
        });

        if (this.onClosestPoi && closest) {
            this.onClosestPoi(closest, minDistance);
        }
    }

    /**
     * Kiểm tra cooldown
     */
    _isInCooldown(poiId) {
        if (!this.cooldownMap.has(poiId)) return false;
        const lastTrigger = this.cooldownMap.get(poiId);
        return (Date.now() - lastTrigger) < this.cooldownDuration;
    }

    /**
     * Tính khoảng cách giữa 2 điểm (Haversine formula) - trả về mét
     */
    _calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371000; // Bán kính trái đất (mét)
        const dLat = this._toRad(lat2 - lat1);
        const dLng = this._toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this._toRad(lat1)) * Math.cos(this._toRad(lat2)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    _toRad(deg) {
        return deg * Math.PI / 180;
    }

    /**
     * Tính khoảng cách từ vị trí hiện tại đến POI
     */
    getDistanceTo(poiLat, poiLng) {
        if (!this.currentPosition) return null;
        return this._calculateDistance(
            this.currentPosition.lat, this.currentPosition.lng,
            poiLat, poiLng
        );
    }

    /**
     * Format khoảng cách
     */
    static formatDistance(meters) {
        if (meters === null || meters === undefined) return '—';
        if (meters < 1000) {
            return `${Math.round(meters)}m`;
        }
        return `${(meters / 1000).toFixed(1)}km`;
    }

    /**
     * Track vị trí lên analytics (giới hạn tần suất)
     */
    _trackLocation(lat, lng) {
        if (!this._lastTrack || Date.now() - this._lastTrack > 15000) {
            this._lastTrack = Date.now();
            fetch('/api/analytics/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType: 'location_update',
                    sessionId: window.APP_SESSION_ID || 'unknown',
                    latitude: lat,
                    longitude: lng
                })
            }).catch(() => {});
        }
    }

    /**
     * Xử lý lỗi GPS
     */
    _onPositionError(error) {
        let message = '';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = 'Vui lòng cho phép truy cập vị trí';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Không thể lấy vị trí GPS';
                break;
            case error.TIMEOUT:
                message = 'Hết thời gian chờ GPS';
                break;
            default:
                message = 'Lỗi GPS không xác định';
        }

        this._notifyStatus('error');
        if (this.onError) {
            this.onError(message, error);
        }
    }

    _notifyStatus(status) {
        if (this.onStatusChange) {
            this.onStatusChange(status, this.currentPosition);
        }
    }
}

// Export global
window.GeofenceManager = GeofenceManager;
