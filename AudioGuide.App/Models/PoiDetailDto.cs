// File: AudioGuide.App/Models/PoiDetailDto.cs
namespace AudioGuide.App.Models
{
    /// <summary>
    /// DTO đại diện cho chi tiết một POI với thuyết minh audio
    /// </summary>
    public class PoiDetailDto
    {
        public Guid PoiId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public int TriggerRadius { get; set; }
        public int Priority { get; set; }
        public string? ImageUrl { get; set; }
        public string LanguageCode { get; set; } = "vi";
        public string TextDescription { get; set; } = string.Empty;
        public string? AudioUrl { get; set; }
        public int? DurationInSeconds { get; set; }
        public string? RequestedLanguage { get; set; }
        public string? LanguageFallbackNote { get; set; }
    }

    /// <summary>
    /// Model dùng để lưu Audio Content trong hàng đợi
    /// </summary>
    public class AudioContent
    {
        public Guid ContentId { get; set; } = Guid.NewGuid();
        public Guid PoiId { get; set; }
        public string PoiName { get; set; } = string.Empty;
        public string LanguageCode { get; set; } = "vi";
        public string TextDescription { get; set; } = string.Empty;
        public string? AudioUrl { get; set; }
        public int? DurationInSeconds { get; set; }
        public DateTime QueuedTime { get; set; } = DateTime.Now;
        public bool IsPlaying { get; set; } = false;
        public int PlaybackSeconds { get; set; } = 0;
    }
}
