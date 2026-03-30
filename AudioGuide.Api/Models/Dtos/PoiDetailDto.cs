// File: AudioGuide.Api/Models/Dtos/PoiDetailDto.cs
namespace AudioGuide.Api.Models.Dtos
{
    /// <summary>
    /// DTO cho thông tin chi tiết một POI (được trả về trong API response)
    /// </summary>
    public class PoiDetailDto
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
        /// Bán kính kích hoạt (mét)
        /// </summary>
        public int TriggerRadius { get; set; }

        /// <summary>
        /// Độ ưu tiên
        /// </summary>
        public int Priority { get; set; }

        /// <summary>
        /// URL hình ảnh
        /// </summary>
        public string? ImageUrl { get; set; }

        /// <summary>
        /// Mã ngôn ngữ của nội dung thuyết minh
        /// </summary>
        public string LanguageCode { get; set; } = "vi";

        /// <summary>
        /// Nội dung mô tả văn bản
        /// </summary>
        public string TextDescription { get; set; } = string.Empty;

        /// <summary>
        /// URL file audio thuyết minh
        /// </summary>
        public string? AudioUrl { get; set; }

        /// <summary>
        /// Thời lượng audio (giây)
        /// </summary>
        public int? DurationInSeconds { get; set; }

        /// <summary>
        /// Ngôn ngữ được yêu cầu từ client
        /// </summary>
        public string? RequestedLanguage { get; set; }

        /// <summary>
        /// Cảnh báo nếu ngôn ngữ yêu cầu không có, đã fallback sang Tiếng Anh
        /// </summary>
        public string? LanguageFallbackNote { get; set; }
    }
}
