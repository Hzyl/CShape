using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CShapeBackend.Models
{
    /// <summary>
    /// Analytics Logs - Theo dõi lượt phát và hoạt động người dùng
    /// </summary>
    [BsonCollection("analytics_logs")]
    public class AnalyticsLog
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("session_id")]
        public string SessionId { get; set; } = string.Empty;

        [BsonElement("poi_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? PoiId { get; set; }

        [BsonElement("tour_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? TourId { get; set; }

        [BsonElement("event_type")]
        public string EventType { get; set; } = string.Empty; // poi_viewed, poi_listened, tour_started, tour_completed

        [BsonElement("duration_seconds")]
        public int DurationSeconds { get; set; } = 0;

        [BsonElement("user_location")]
        public GeoLocation? UserLocation { get; set; }

        [BsonElement("user_agent")]
        public string? UserAgent { get; set; }

        [BsonElement("device_type")]
        public string? DeviceType { get; set; } // mobile, web, ios, android

        [BsonElement("language")]
        public string Language { get; set; } = "vi"; // vi, en, jp

        [BsonElement("timestamp")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Geographic location for analytics
    /// </summary>
    public class GeoLocation
    {
        [BsonElement("latitude")]
        public double Latitude { get; set; }

        [BsonElement("longitude")]
        public double Longitude { get; set; }

        [BsonElement("accuracy_meters")]
        public double? AccuracyMeters { get; set; }
    }
}
