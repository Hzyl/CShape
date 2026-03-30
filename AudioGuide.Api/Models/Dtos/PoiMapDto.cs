// File: AudioGuide.Api/Models/Dtos/PoiMapDto.cs
namespace AudioGuide.Api.Models.Dtos
{
    /// <summary>
    /// DTO cho danh sách POI trên bản đồ (lightweight version)
    /// Được sử dụng khi API trả về danh sách POI gần vị trí hiện tại
    /// </summary>
    public class PoiMapDto
    {
        /// <summary>
        /// ID của POI
        /// </summary>
        public Guid PoiId { get; set; }

        /// <summary>
        /// Tên địa điểm
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Vĩ độ
        /// </summary>
        public decimal Latitude { get; set; }

        /// <summary>
        /// Kinh độ
        /// </summary>
        public decimal Longitude { get; set; }

        /// <summary>
        /// URL hình ảnh cho icon trên bản đồ
        /// </summary>
        public string? ImageUrl { get; set; }

        /// <summary>
        /// Khoảng cách từ vị trí người dùng tới POI này (mét)
        /// Tính toán bằng công thức Haversine
        /// </summary>
        public double? DistanceInMeters { get; set; }

        /// <summary>
        /// Bán kính kích hoạt GPS (mét)
        /// </summary>
        public int TriggerRadius { get; set; }

        /// <summary>
        /// Độ ưu tiên (1-10)
        /// </summary>
        public int Priority { get; set; }

        /// <summary>
        /// Metadata - Số lượng ngôn ngữ thuyết minh có sẵn
        /// </summary>
        public int AvailableLanguagesCount { get; set; }
    }
}
