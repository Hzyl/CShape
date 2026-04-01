using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace VinhKhanhFoodTour.Api.Models
{
    /// <summary>
    /// Tour thuyết minh - Một lộ trình gồm nhiều POI theo thứ tự
    /// </summary>
    public class Tour
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        public Dictionary<string, string> Name { get; set; } = new();

        [BsonElement("description")]
        public Dictionary<string, string> Description { get; set; } = new();

        /// <summary>Danh sách POI ID theo thứ tự tour</summary>
        [BsonElement("poiIds")]
        public List<string> PoiIds { get; set; } = new();

        /// <summary>Thời lượng ước tính (phút)</summary>
        [BsonElement("estimatedDuration")]
        public int EstimatedDuration { get; set; }

        /// <summary>Khoảng cách ước tính (km)</summary>
        [BsonElement("estimatedDistance")]
        public double EstimatedDistance { get; set; }

        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
