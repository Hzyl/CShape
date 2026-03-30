// File: AudioGuide.App/Services/IGeofenceService.cs
using AudioGuide.App.Models;

namespace AudioGuide.App.Services
{
    /// <summary>
    /// Event args khi người dùng vào/ra một geofence region
    /// </summary>
    public class GeofenceEventArgs : EventArgs
    {
        public Guid PoiId { get; set; }
        public string PoiName { get; set; } = string.Empty;
        public bool IsEntered { get; set; } // true = entered, false = exited
        public DateTime Timestamp { get; set; } = DateTime.Now;
    }

    /// <summary>
    /// Interface định nghĩa Geofencing service sử dụng Shiny.NET
    /// Dùng để phát hiện khi người dùng vào gần một POI (geofence trigger)
    /// </summary>
    public interface IGeofenceService
    {
        /// <summary>
        /// Bắt đầu tracking geofence
        /// Sẽ lắng nghe các sự kiện geofence từ Shiny.NET
        /// </summary>
        Task StartGeofencingAsync(List<PoiMapDto> pois);

        /// <summary>
        /// Dừng tracking geofence
        /// </summary>
        Task StopGeofencingAsync();

        /// <summary>
        /// Kiểm tra trạng thái geofencing có đang chạy không
        /// </summary>
        bool IsGeofencingActive { get; }

        /// <summary>
        /// Lấy danh sách POI đang được tracked
        /// </summary>
        List<PoiMapDto> TrackedPois { get; }

        /// <summary>
        /// Event bắn khi người dùng vào một geofence region
        /// </summary>
        event EventHandler<GeofenceEventArgs>? OnGeofenceEntered;

        /// <summary>
        /// Event bắn khi người dùng ra khỏi một geofence region
        /// </summary>
        event EventHandler<GeofenceEventArgs>? OnGeofenceExited;

        /// <summary>
        /// Event bắn khi có lỗi xảy ra
        /// </summary>
        event EventHandler<string>? OnError;
    }
}
