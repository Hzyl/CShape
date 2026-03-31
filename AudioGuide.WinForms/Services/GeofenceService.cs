using AudioGuide.WinForms.Helpers;
using AudioGuide.WinForms.Models;

namespace AudioGuide.WinForms.Services
{
    /// <summary>
    /// Thực thi IGeofenceService cho WinForms (Desktop)
    /// Lưu ý: Geofencing trên Desktop không giống mobile
    /// Đây là một implementation đơn giản dùng background check vị trí
    /// </summary>
    public class GeofenceService : IGeofenceService
    {
        private List<PoiMapDto> _monitoredPois = new();
        private CancellationTokenSource? _geofencingCts;
        private decimal _currentLatitude = 0;
        private decimal _currentLongitude = 0;
        private Dictionary<Guid, bool> _poiEntered = new();

        public bool IsGeofencingActive => _geofencingCts != null && !_geofencingCts.Token.IsCancellationRequested;

        public event EventHandler<GeofenceEventArgs>? OnGeofenceEntered;
        public event EventHandler<GeofenceEventArgs>? OnGeofenceExited;

        public GeofenceService()
        {
            Constants.DebugLog("📍 GeofenceService khởi tạo (WinForms version)");
        }

        /// <summary>
        /// Bắt đầu monitoring geofence
        /// </summary>
        public async Task StartGeofencingAsync(List<PoiMapDto> pois)
        {
            try
            {
                Constants.DebugLog($"🚀 Bắt đầu geofencing cho {pois.Count} POI");

                _monitoredPois = pois;
                _poiEntered.Clear();

                // Khởi tạo token source
                _geofencingCts = new CancellationTokenSource();

                // Bắt đầu background task để monitor geofence
                _ = MonitorGeofenceAsync(_geofencingCts.Token);

                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi bắt đầu geofencing", ex);
            }
        }

        /// <summary>
        /// Dừng monitoring geofence
        /// </summary>
        public async Task StopGeofencingAsync()
        {
            try
            {
                Constants.DebugLog("🛑 Dừng geofencing");

                _geofencingCts?.Cancel();
                _geofencingCts?.Dispose();
                _geofencingCts = null;
                _monitoredPois.Clear();
                _poiEntered.Clear();

                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi dừng geofencing", ex);
            }
        }

        /// <summary>
        /// Cập nhật vị trí người dùng cho geofencing
        /// Phương thức này cần được gọi từ bên ngoài (ví dụ: từ main form)
        /// </summary>
        public void UpdateUserLocation(decimal latitude, decimal longitude)
        {
            _currentLatitude = latitude;
            _currentLongitude = longitude;
        }

        /// <summary>
        /// Background task để monitor geofence
        /// </summary>
        private async Task MonitorGeofenceAsync(CancellationToken cancellationToken)
        {
            try
            {
                while (!cancellationToken.IsCancellationRequested)
                {
                    // Check mỗi 5 giây
                    await Task.Delay(5000, cancellationToken);

                    foreach (var poi in _monitoredPois)
                    {
                        // Tính khoảng cách từ vị trí hiện tại tới POI
                        var distance = CalculateDistance(_currentLatitude, _currentLongitude, poi.Latitude, poi.Longitude);

                        // Kiểm tra xem có trong geofence không
                        bool isInGeofence = distance <= poi.TriggerRadius;
                        bool wasInGeofence = _poiEntered.ContainsKey(poi.PoiId) && _poiEntered[poi.PoiId];

                        // Nếu vừa vào geofence
                        if (isInGeofence && !wasInGeofence)
                        {
                            _poiEntered[poi.PoiId] = true;
                            OnGeofenceEntered?.Invoke(this, new GeofenceEventArgs
                            {
                                PoiId = poi.PoiId,
                                PoiName = poi.Name,
                                Latitude = poi.Latitude,
                                Longitude = poi.Longitude,
                                TriggerRadius = poi.TriggerRadius
                            });
                            Constants.DebugLog($"🚪 Vào geofence: {poi.Name}");
                        }
                        // Nếu vừa ra khỏi geofence
                        else if (!isInGeofence && wasInGeofence)
                        {
                            _poiEntered[poi.PoiId] = false;
                            OnGeofenceExited?.Invoke(this, new GeofenceEventArgs
                            {
                                PoiId = poi.PoiId,
                                PoiName = poi.Name,
                                Latitude = poi.Latitude,
                                Longitude = poi.Longitude,
                                TriggerRadius = poi.TriggerRadius
                            });
                            Constants.DebugLog($"👋 Ra khỏi geofence: {poi.Name}");
                        }
                    }
                }
            }
            catch (OperationCanceledException)
            {
                Constants.DebugLog("⏹️ Geofencing monitoring bị hủy");
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi trong geofencing monitoring", ex);
            }
        }

        /// <summary>
        /// Tính khoảng cách giữa hai điểm GPS bằng Haversine formula
        /// </summary>
        private double CalculateDistance(decimal lat1, decimal lon1, decimal lat2, decimal lon2)
        {
            const double R = 6371000; // Bán kính Trái Đất (mét)

            var dLat = (double)(lat2 - lat1) * Math.PI / 180.0;
            var dLon = (double)(lon2 - lon1) * Math.PI / 180.0;
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos((double)lat1 * Math.PI / 180.0) * Math.Cos((double)lat2 * Math.PI / 180.0) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return R * c; // Khoảng cách tính bằng mét
        }
    }
}
