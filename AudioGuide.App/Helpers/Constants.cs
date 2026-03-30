// File: AudioGuide.App/Helpers/Constants.cs
namespace AudioGuide.App.Helpers
{
    /// <summary>
    /// Chứa các hằng số cấu hình cho toàn bộ ứng dụng
    /// </summary>
    public static class Constants
    {
        // ========== API Configuration ==========
        /// <summary>
        /// Base URL của Backend API
        /// - Android Emulator: 10.0.2.2 (IP ảo để trỏ tới localhost của máy chủ)
        /// - iOS Simulator: localhost
        /// - Windows: localhost
        /// - Physical Device: Sử dụng IP máy chủ thực (ví dụ: 192.168.1.100)
        /// </summary>
        public static string ApiBaseUrl
        {
            get
            {
#if DEBUG
                // Thời gian phát triển - Chỉ định URL dựa trên platform
                return DeviceInfo.Platform == DevicePlatform.Android
                    ? "http://10.0.2.2:5000" // Android Emulator
                    : "http://localhost:5000"; // iOS simulator, Windows, Physical Device on localhost
#else
                // Production - Có thể đặt riêng
                return "https://api.audioguidesystem.com";
#endif
            }
        }

        /// <summary>
        /// Timeout cho HTTP requests (milliseconds)
        /// </summary>
        public const int HttpRequestTimeoutMs = 30000; // 30 giây

        /// <summary>
        /// Timeout cho Location service bắn event (milliseconds)
        /// </summary>
        public const int LocationTimeoutMs = 10000; // 10 giây

        // ========== GPS & Geofencing Configuration ==========
        /// <summary>
        /// Độ chính xác GPS yêu cầu (mét)
        /// Chỉ sử dụng vị trí GPS khi độ chính xác tốt hơn giá trị này
        /// </summary>
        public const int GpsAccuracyThresholdMeters = 50;

        /// <summary>
        /// Khoảng cách tìm kiếm POI gần vị trí (mét)
        /// Mặc định 5000m = 5km
        /// </summary>
        public const int DefaultSearchRadiusMeters = 5000;

        /// <summary>
        /// Bán kính tối đa cho tìm kiếm POI (mét)
        /// </summary>
        public const int MaxSearchRadiusMeters = 50000; // 50km

        /// <summary>
        /// Bán kính tối thiểu cho tìm kiếm POI (mét)
        /// </summary>
        public const int MinSearchRadiusMeters = 100; // 100m

        /// <summary>
        /// Khoảng cách tối thiểu để cập nhật vị trí (mét)
        /// Chỉ cập nhật danh sách POI khi người dùng di chuyển >100m từ vị trí trước
        /// </summary>
        public const int LocationUpdateThresholdMeters = 100;

        // ========== Audio Queue Configuration ==========
        /// <summary>
        /// Thời gian cooldown giữa các lần phát audio (phút)
        /// Chống spam: KHÔNG cho POI vào hàng đợi nếu đã phát < 5 phút
        /// </summary>
        public const int AudioQueueCooldownMinutes = 5;

        /// <summary>
        /// Số lượng audio tối đa trong hàng đợi
        /// </summary>
        public const int MaxAudioQueueSize = 10;

        // ========== Language Configuration ==========
        /// <summary>
        /// Danh sách ngôn ngữ được hỗ trợ
        /// </summary>
        public static readonly string[] SupportedLanguages = { "vi", "en", "jp" };

        /// <summary>
        /// Tên hiển thị của các ngôn ngữ
        /// </summary>
        public static readonly Dictionary<string, string> LanguageDisplayNames = new()
        {
            { "vi", "Tiếng Việt" },
            { "en", "English" },
            { "jp", "日本語 (Tiếng Nhật)" }
        };

        /// <summary>
        /// Ngôn ngữ mặc định
        /// </summary>
        public const string DefaultLanguage = "vi";

        // ========== UI Configuration ==========
        /// <summary>
        /// Thời gian hiển thị Toast message (milliseconds)
        /// </summary>
        public const int ToastDurationMs = 3000; // 3 giây

        /// <summary>
        /// Thời gian chờ trước khi load thêm danh sách POI (milliseconds)
        /// </summary>
        public const int LoadMoreDelayMs = 500;

        // ========== Storage Keys ==========
        /// <summary>
        /// Key cho lưu trữ ngôn ngữ được chọn trong Preferences
        /// </summary>
        public const string PreferenceKeyLanguage = "SelectedLanguage";

        /// <summary>
        /// Key cho lưu trữ vị trí cuối cùng đã tìm kiếm
        /// </summary>
        public const string PreferenceKeyLastLocation = "LastSearchLocation";

        /// <summary>
        /// Key cho lưu trữ danh sách POI được yêu thích
        /// </summary>
        public const string PreferenceKeyFavoritePois = "FavoritePois";

        /// <summary>
        /// Key cho lưu trữ audio queue history (lịch sử audio đã phát)
        /// </summary>
        public const string PreferenceKeyAudioHistory = "AudioPlaybackHistory";

        // ========== Geofencing Events ==========
        /// <summary>
        /// Tên của geofence region (dùng để identify event)
        /// </summary>
        public const string GeofenceRegionName = "PoiGeofence";

        // ========== Debug Mode ==========
        /// <summary>
        /// Kích hoạt debug logs
        /// </summary>
        public static bool IsDebugMode
        {
            get
            {
#if DEBUG
                return true;
#else
                return false;
#endif
            }
        }

        // ========== Utility Methods ==========
        /// <summary>
        /// Log ra console - chỉ kích hoạt khi DEBUG mode
        /// </summary>
        public static void DebugLog(string message)
        {
            if (IsDebugMode)
            {
                Debug.WriteLine($"[AudioGuide] {DateTime.Now:HH:mm:ss.fff} - {message}");
            }
        }

        /// <summary>
        /// Log lỗi ra console - luôn kích hoạt
        /// </summary>
        public static void ErrorLog(string message, Exception? ex = null)
        {
            Debug.WriteLine($"[AudioGuide Error] {DateTime.Now:HH:mm:ss.fff} - {message}");
            if (ex != null)
            {
                Debug.WriteLine($"[AudioGuide Error] Exception: {ex.Message}");
                Debug.WriteLine($"[AudioGuide Error] StackTrace: {ex.StackTrace}");
            }
        }
    }
}
