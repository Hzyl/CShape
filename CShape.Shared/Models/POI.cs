using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CShape.Shared.Models;

/// <summary>
/// Point of Interest (POI) model
/// </summary>
public class POI
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Category { get; set; }

    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int TriggerRadius { get; set; } = 100; // meters
    public int Priority { get; set; } = 0;

    public string DescriptionVi { get; set; } = string.Empty;
    public string? DescriptionEn { get; set; }
    public string? DescriptionJp { get; set; }

    public List<string>? ImageUrls { get; set; }
    public string? AudioUrl { get; set; }
    public string AudioStatus { get; set; } = "pending"; // pending, processing, completed

    public string? QrCodeHash { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
