namespace AudioGuide.WinForms.Models
{
    /// <summary>
    /// DTO đại diện cho một POI trên bản đồ (lightweight version)
    /// </summary>
    public class PoiMapDto
    {
        public Guid PoiId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public string? ImageUrl { get; set; }
        public double? DistanceInMeters { get; set; }
        public int TriggerRadius { get; set; }
        public int Priority { get; set; }
        public int AvailableLanguagesCount { get; set; }
    }
}
