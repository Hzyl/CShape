using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CShapeBackend.Models
{
    /// <summary>
    /// Points of Interest (POIs) - Điểm tham quan
    /// </summary>
    [BsonCollection("pois")]
    public class POI
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; } = string.Empty;

        [BsonElement("type")]
        public string Type { get; set; } = "major"; // major or minor

        [BsonElement("category")]
        public string? Category { get; set; } = null; // wc, ban_ve, gui_xe, ben_thuyen, etc.

        [BsonElement("latitude")]
        public double Latitude { get; set; }

        [BsonElement("longitude")]
        public double Longitude { get; set; }

        [BsonElement("trigger_radius")]
        public int TriggerRadius { get; set; } = 30; // meters

        [BsonElement("priority")]
        public int Priority { get; set; } = 1; // 1-10

        [BsonElement("description_vi")]
        public string DescriptionVi { get; set; } = string.Empty;

        [BsonElement("description_en")]
        public string? DescriptionEn { get; set; }

        [BsonElement("description_jp")]
        public string? DescriptionJp { get; set; }

        [BsonElement("image_urls")]
        public List<string> ImageUrls { get; set; } = new();

        [BsonElement("audio_status")]
        public string AudioStatus { get; set; } = "pending"; // pending, processing, completed, failed

        [BsonElement("audio_url")]
        public string? AudioUrl { get; set; }

        [BsonElement("qr_code_hash")]
        public string QrCodeHash { get; set; } = string.Empty;

        [BsonElement("created_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updated_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("created_by")]
        public string? CreatedBy { get; set; }
    }
}
