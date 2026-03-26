using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CShape.Shared.Models;

/// <summary>
/// Tour model for guided experiences
/// </summary>
public class Tour
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Name { get; set; } = string.Empty;
    public string TitleVi { get; set; } = string.Empty;
    public string? TitleEn { get; set; }
    public string? TitleJp { get; set; }

    public string DescriptionVi { get; set; } = string.Empty;
    public string? DescriptionEn { get; set; }
    public string? DescriptionJp { get; set; }

    public string? ThumbnailUrl { get; set; }
    public List<string> POIIds { get; set; } = new(); // Ordered list of POI IDs
    public int Priority { get; set; } = 0;

    public string Status { get; set; } = "draft"; // draft, published, archived
    public bool IsActive { get; set; } = true;

    public int EstimatedDurationMinutes { get; set; } = 0;
    public double? TotalDistance { get; set; } // in kilometers

    public string CreatedByUserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
