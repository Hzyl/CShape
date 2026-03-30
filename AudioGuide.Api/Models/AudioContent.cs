// File: AudioGuide.Api/Models/AudioContent.cs
namespace AudioGuide.Api.Models
{
    /// <summary>
    /// Model đại diện cho nội dung thuyết minh audio đa ngôn ngữ
    /// </summary>
    public class AudioContent
    {
        /// <summary>
        /// ID duy nhất của nội dung thuyết minh
        /// </summary>
        public Guid ContentId { get; set; } = Guid.NewGuid();

        /// <summary>
        /// ID của POI mà nội dung này thuộc về
        /// </summary>
        public Guid PoiId { get; set; }

        /// <summary>
        /// Navigation property - Tham chiếu đến PointOfInterest
        /// </summary>
        public virtual PointOfInterest PointOfInterest { get; set; } = null!;

        /// <summary>
        /// Mã ngôn ngữ (vi, en, jp, etc.)
        /// </summary>
        public string LanguageCode { get; set; } = "vi";

        /// <summary>
        /// Nội dung mô tả văn bản của thuyết minh
        /// </summary>
        public string TextDescription { get; set; } = string.Empty;

        /// <summary>
        /// URL của file audio thuyết minh
        /// Ví dụ: https://cdn.example.com/audio/poi-001-vi.mp3
        /// </summary>
        public string? AudioUrl { get; set; }

        /// <summary>
        /// Thời lượng audio (đơn vị: giây)
        /// </summary>
        public int? DurationInSeconds { get; set; }

        /// <summary>
        /// Ngày giờ tạo
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Ngày giờ cập nhật lần cuối
        /// </summary>
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
