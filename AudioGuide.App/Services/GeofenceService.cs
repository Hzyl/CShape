// File: AudioGuide.App/Services/GeofenceService.cs
using Shiny.Locations;
using AudioGuide.App.Helpers;
using AudioGuide.App.Models;

namespace AudioGuide.App.Services
{
    /// <summary>
    /// Thực thi IGeofenceService sử dụng Shiny.NET
    /// Tạo geofence regions cho mỗi POI và xử lý các sự kiện
    /// </summary>
    public class GeofenceService : IGeofenceService
    {
        private readonly IGeolocator _geolocator;
        private List<PoiMapDto> _trackedPois = new();
        private bool _isGeofencingActive = false;

        public bool IsGeofencingActive => _isGeofencingActive;
        public List<PoiMapDto> TrackedPois => _trackedPois;

        public event EventHandler<GeofenceEventArgs>? OnGeofenceEntered;
        public event EventHandler<GeofenceEventArgs>? OnGeofenceExited;
        public event EventHandler<string>? OnError;

        public GeofenceService()
        {
            // TODO: Shiny.NET initialization
            // Khi Shiny.NET được cấu hình trong MauiProgram.cs
            _geolocator = null!; // Sẽ được inject thông qua DI
            Constants.DebugLog("🔍 GeofenceService đã được khởi tạo");
        }

        /// <summary>
        /// Bắt đầu tracking geofence cho danh sách POIs
        /// </summary>
        public async Task StartGeofencingAsync(List<PoiMapDto> pois)
        {
            try
            {
                if (_isGeofencingActive)
                {
                    Constants.DebugLog("⚠️ Geofencing đã đang chạy, dừng trước khi bắt đầu lại");
                    await StopGeofencingAsync();
                }

                _trackedPois = pois;
                _isGeofencingActive = true;

                Constants.DebugLog($"🚀 Bắt đầu geofencing cho {pois.Count} POI");

                // TODO: Implement Shiny.NET geofence setup
                // for each POI, create a geofence region using Shiny.NET
                foreach (var poi in pois)
                {
                    Constants.DebugLog($"📍 Tạo geofence: {poi.Name} (bán kính {poi.TriggerRadius}m)");
                    // Example (pseudo-code):
                    // await _geofenceManager.AddRegion(new GeofenceRegion
                    // {
                    //     Identifier = poi.PoiId.ToString(),
                    //     Latitude = (double)poi.Latitude,
                    //     Longitude = (double)poi.Longitude,
                    //     Radius = poi.TriggerRadius
                    // });
                }

                Constants.DebugLog("✅ Geofencing đã được bắt đầu thành công");
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi bắt đầu geofencing", ex);
                OnError?.Invoke(this, $"Lỗi khi bắt đầu geofencing: {ex.Message}");
                _isGeofencingActive = false;
            }
        }

        /// <summary>
        /// Dừng tracking geofence
        /// </summary>
        public async Task StopGeofencingAsync()
        {
            try
            {
                if (!_isGeofencingActive)
                {
                    Constants.DebugLog("ℹ️ Geofencing không đang chạy");
                    return;
                }

                Constants.DebugLog("🛑 Dừng geofencing");

                // TODO: Remove all geofence regions from Shiny.NET
                // Example (pseudo-code):
                // await _geofenceManager.RemoveAllRegions();

                _isGeofencingActive = false;
                _trackedPois.Clear();

                Constants.DebugLog("✅ Geofencing đã được dừng");
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi dừng geofencing", ex);
                OnError?.Invoke(this, $"Lỗi khi dừng geofencing: {ex.Message}");
            }
        }

        /// <summary>
        /// Phương thức được gọi khi người dùng vào một geofence region
        /// (Gọi từ Shiny.NET background service)
        /// </summary>
        public void TriggerGeofenceEntered(Guid poiId, string poiName)
        {
            try
            {
                Constants.DebugLog($"🚪 Người dùng vào geofence: {poiName}");
                OnGeofenceEntered?.Invoke(this, new GeofenceEventArgs
                {
                    PoiId = poiId,
                    PoiName = poiName,
                    IsEntered = true,
                    Timestamp = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi xử lý geofence entered", ex);
            }
        }

        /// <summary>
        /// Phương thức được gọi khi người dùng ra khỏi một geofence region
        /// </summary>
        public void TriggerGeofenceExited(Guid poiId, string poiName)
        {
            try
            {
                Constants.DebugLog($"🚪 Người dùng ra khỏi geofence: {poiName}");
                OnGeofenceExited?.Invoke(this, new GeofenceEventArgs
                {
                    PoiId = poiId,
                    PoiName = poiName,
                    IsEntered = false,
                    Timestamp = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi xử lý geofence exited", ex);
            }
        }
    }
}
