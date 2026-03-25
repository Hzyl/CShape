using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CShapeBackend.Models
{
    /// <summary>
    /// Tours - Các tuyến du lịch
    /// </summary>
    [BsonCollection("tours")]
    public class Tour
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; } = string.Empty;

        [BsonElement("description")]
        public string Description { get; set; } = string.Empty;

        [BsonElement("pois")]
        public List<TourPOI> POIs { get; set; } = new();

        [BsonElement("thumbnail_url")]
        public string? ThumbnailUrl { get; set; }

        [BsonElement("status")]
        public string Status { get; set; } = "draft"; // draft, published, archived

        [BsonElement("estimated_duration_minutes")]
        public int EstimatedDurationMinutes { get; set; } = 0;

        [BsonElement("created_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updated_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("created_by")]
        public string? CreatedBy { get; set; }
    }

    /// <summary>
    /// Tour POI - POI trong Tour (với thứ tự và thông tin)
    /// </summary>
    public class TourPOI
    {
        [BsonElement("poi_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string PoiId { get; set; } = string.Empty;

        [BsonElement("poi_name")]
        public string PoiName { get; set; } = string.Empty;

        [BsonElement("order_index")]
        public int OrderIndex { get; set; } = 0;

        [BsonElement("stop_duration_minutes")]
        public int StopDurationMinutes { get; set; } = 10; // Suggested stop time
    }
}
