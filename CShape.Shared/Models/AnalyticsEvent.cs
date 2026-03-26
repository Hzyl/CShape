using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CShape.Shared.Models;

/// <summary>
/// Analytics event model for tracking user interactions
/// </summary>
public class AnalyticsEvent
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string SessionId { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty; // tour_started, tour_completed, poi_viewed, audio_played, etc.

    public string? TourId { get; set; }
    public string? POIId { get; set; }

    public string? DeviceId { get; set; }
    public string? DeviceType { get; set; } // iOS, Android, Web
    public string? OSVersion { get; set; }
    public string? AppVersion { get; set; }

    public string? UserLanguage { get; set; } // vi, en, ja
    public double? latitude { get; set; }
    public double? Longitude { get; set; }

    public int? DurationSeconds { get; set; }
    public Dictionary<string, object>? CustomData { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
