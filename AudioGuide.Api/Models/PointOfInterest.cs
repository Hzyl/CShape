// File: AudioGuide.Api/Models/PointOfInterest.cs
namespace AudioGuide.Api.Models
{
    /// <summary>
    /// Model đại diện cho một Điểm Du Lịch (POI - Point of Interest)
    /// </summary>
    public class PointOfInterest
    {
        /// <summary>
        /// ID duy nhất của POI
        /// </summary>
        public Guid PoiId { get; set; } = Guid.NewGuid();

        /// <summary>
        /// Tên địa điểm du lịch
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Vĩ độ của địa điểm (Latitude)
        /// </summary>
        public decimal Latitude { get; set; }

        /// <summary>
        /// Kinh độ của địa điểm (Longitude)
        /// </summary>
        public decimal Longitude { get; set; }

        /// <summary>
        /// Bán kính kích hoạt GPS (đơn vị: mét)
        /// Khi người dùng vào bán kính này, thuyết minh sẽ được tự động phát
        /// </summary>
        public int TriggerRadius { get; set; }

        /// <summary>
        /// Độ ưu tiên của POI (1-10)
        /// Dùng để xác định thứ tự khi nhiều vùng GPS giao nhau
        /// </summary>
        public int Priority { get; set; } = 5;

        /// <summary>
        /// URL hình ảnh minh họa của địa điểm
        /// </summary>
        public string? ImageUrl { get; set; }

        /// <summary>
        /// Mã băm QR Code để đối chiếu khi người dùng quét QR
        /// </summary>
        public string QrCodeHash { get; set; } = string.Empty;

        /// <summary>
        /// Ngày giờ tạo POI
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Ngày giờ cập nhật lần cuối
        /// </summary>
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Danh sách nội dung thuyết minh đa ngôn ngữ
        /// </summary>
        public virtual ICollection<AudioContent> AudioContents { get; set; } = new List<AudioContent>();
    }
}
