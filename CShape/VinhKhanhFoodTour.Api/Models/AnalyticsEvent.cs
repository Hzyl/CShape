using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace VinhKhanhFoodTour.Api.Models
{
    /// <summary>
    /// Sự kiện analytics - Lưu hành vi người dùng (ẩn danh)
    /// </summary>
    public class AnalyticsEvent
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        /// <summary>Loại sự kiện: poi_enter, poi_listen, poi_complete, location_update, qr_scan</summary>
        [BsonElement("eventType")]
        public string EventType { get; set; } = string.Empty;

        /// <summary>ID của POI liên quan (nếu có)</summary>
        [BsonElement("poiId")]
        public string? PoiId { get; set; }

        /// <summary>Session ID ẩn danh</summary>
        [BsonElement("sessionId")]
        public string SessionId { get; set; } = string.Empty;

        /// <summary>Thời gian nghe (giây)</summary>
        [BsonElement("duration")]
        public double? Duration { get; set; }

        /// <summary>Vĩ độ tại thời điểm sự kiện</summary>
        [BsonElement("latitude")]
        public double? Latitude { get; set; }

        /// <summary>Kinh độ tại thời điểm sự kiện</summary>
        [BsonElement("longitude")]
        public double? Longitude { get; set; }

        /// <summary>Ngôn ngữ đang sử dụng</summary>
        [BsonElement("language")]
        public string? Language { get; set; }

        [BsonElement("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>DTO cho thống kê POI</summary>
    public class PoiStats
    {
        public string PoiId { get; set; } = string.Empty;
        public string PoiName { get; set; } = string.Empty;
        public int ListenCount { get; set; }
        public double AvgDuration { get; set; }
    }

    /// <summary>DTO cho heatmap</summary>
    public class HeatmapPoint
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int Intensity { get; set; }
    }
}
