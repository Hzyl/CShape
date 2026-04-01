using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace VinhKhanhFoodTour.Api.Models
{
    /// <summary>
    /// Điểm thuyết minh (Point of Interest) - Mỗi quán/địa điểm trên phố Vĩnh Khánh
    /// </summary>
    public class Poi
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        /// <summary>Tên điểm (đa ngôn ngữ): { "vi": "Ốc Đào", "en": "Oc Dao Restaurant", ... }</summary>
        [BsonElement("name")]
        public Dictionary<string, string> Name { get; set; } = new();

        /// <summary>Mô tả chi tiết (đa ngôn ngữ)</summary>
        [BsonElement("description")]
        public Dictionary<string, string> Description { get; set; } = new();

        /// <summary>Script TTS thuyết minh (đa ngôn ngữ)</summary>
        [BsonElement("ttsScript")]
        public Dictionary<string, string> TtsScript { get; set; } = new();

        /// <summary>Vĩ độ</summary>
        [BsonElement("latitude")]
        public double Latitude { get; set; }

        /// <summary>Kinh độ</summary>
        [BsonElement("longitude")]
        public double Longitude { get; set; }

        /// <summary>Bán kính kích hoạt geofence (mét)</summary>
        [BsonElement("radius")]
        public double Radius { get; set; } = 50;

        /// <summary>Mức độ ưu tiên (1 = cao nhất)</summary>
        [BsonElement("priority")]
        public int Priority { get; set; } = 5;

        /// <summary>Đường dẫn ảnh minh họa</summary>
        [BsonElement("imageUrl")]
        public string? ImageUrl { get; set; }

        /// <summary>Đường dẫn file audio (nếu có)</summary>
        [BsonElement("audioUrl")]
        public string? AudioUrl { get; set; }

        /// <summary>Danh mục: seafood, hotpot, snack, street_food, landmark</summary>
        [BsonElement("category")]
        public string Category { get; set; } = "street_food";

        /// <summary>Đang hoạt động?</summary>
        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;

        /// <summary>Địa chỉ</summary>
        [BsonElement("address")]
        public string? Address { get; set; }

        /// <summary>Giờ mở cửa</summary>
        [BsonElement("openingHours")]
        public string? OpeningHours { get; set; }

        /// <summary>Khoảng giá</summary>
        [BsonElement("priceRange")]
        public string? PriceRange { get; set; }

        /// <summary>QR Code ID duy nhất</summary>
        [BsonElement("qrCode")]
        public string? QrCode { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
