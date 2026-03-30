// File: AudioGuide.App/Services/IApiService.cs
using AudioGuide.App.Models;

namespace AudioGuide.App.Services
{
    /// <summary>
    /// Interface định nghĩa các method gọi Backend API
    /// Sử dụng HttpClient để kết nối tới AudioGuide.Api
    /// </summary>
    public interface IApiService
    {
        /// <summary>
        /// Lấy danh sách POI gần vị trí hiện tại
        /// </summary>
        /// <param name="latitude">Vĩ độ</param>
        /// <param name="longitude">Kinh độ</param>
        /// <param name="radius">Bán kính tìm kiếm (mét)</param>
        /// <returns>Danh sách POI gần vị trí</returns>
        Task<ApiResponse<List<PoiMapDto>>> GetNearbyPoisAsync(decimal latitude, decimal longitude, int radius);

        /// <summary>
        /// Lấy chi tiết thuyết minh của một POI với hỗ trợ đa ngôn ngữ
        /// </summary>
        /// <param name="poiId">ID của POI</param>
        /// <param name="language">Mã ngôn ngữ yêu cầu</param>
        /// <returns>Chi tiết POI</returns>
        Task<ApiResponse<PoiDetailDto>> GetPoiDetailAsync(Guid poiId, string language);

        /// <summary>
        /// Lấy POI thông qua QR Code Hash
        /// </summary>
        /// <param name="qrHash">Mã băm QR Code</param>
        /// <param name="language">Mã ngôn ngữ yêu cầu</param>
        /// <returns>Chi tiết POI được quét qua QR</returns>
        Task<ApiResponse<PoiDetailDto>> GetPoiByQrCodeAsync(string qrHash, string language);

        /// <summary>
        /// Kiểm tra API có hoạt động không (Health Check)
        /// </summary>
        /// <returns>True nếu API healthy, False nếu không</returns>
        Task<bool> HealthCheckAsync();
    }

    /// <summary>
    /// Generic wrapper cho API responses từ Backend
    /// </summary>
    /// <typeparam name="T">Kiểu dữ liệu của response data</typeparam>
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
        public Dictionary<string, object>? AdditionalInfo { get; set; }
    }
}
