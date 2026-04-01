using MongoDB.Driver;
using VinhKhanhFoodTour.Api.Models;

namespace VinhKhanhFoodTour.Api.Services
{
    public class AnalyticsService
    {
        private readonly IMongoCollection<AnalyticsEvent> _events;

        public AnalyticsService(IMongoDatabase database)
        {
            _events = database.GetCollection<AnalyticsEvent>("analytics");
        }

        /// <summary>Lưu sự kiện analytics</summary>
        public async Task<AnalyticsEvent> TrackEventAsync(AnalyticsEvent ev)
        {
            ev.Timestamp = DateTime.UtcNow;
            await _events.InsertOneAsync(ev);
            return ev;
        }

        /// <summary>Lấy thống kê POI được nghe nhiều nhất</summary>
        public async Task<List<PoiStats>> GetTopPoiStatsAsync(int limit = 10)
        {
            var pipeline = _events.Aggregate()
                .Match(e => e.EventType == "poi_listen" && e.PoiId != null)
                .Group(e => e.PoiId, g => new PoiStats
                {
                    PoiId = g.Key!,
                    ListenCount = g.Count(),
                    AvgDuration = g.Average(e => e.Duration ?? 0)
                })
                .SortByDescending(s => s.ListenCount)
                .Limit(limit);

            return await pipeline.ToListAsync();
        }

        /// <summary>Lấy dữ liệu heatmap từ location_update events</summary>
        public async Task<List<HeatmapPoint>> GetHeatmapDataAsync()
        {
            var events = await _events
                .Find(e => e.Latitude != null && e.Longitude != null)
                .ToListAsync();

            // Nhóm theo vùng (làm tròn tọa độ) để tạo heatmap
            var heatmap = events
                .GroupBy(e => new
                {
                    Lat = Math.Round(e.Latitude!.Value, 4),
                    Lng = Math.Round(e.Longitude!.Value, 4)
                })
                .Select(g => new HeatmapPoint
                {
                    Latitude = g.Key.Lat,
                    Longitude = g.Key.Lng,
                    Intensity = g.Count()
                })
                .ToList();

            return heatmap;
        }

        /// <summary>Lấy tổng số sự kiện theo loại</summary>
        public async Task<Dictionary<string, long>> GetEventCountsAsync()
        {
            var eventTypes = new[] { "poi_enter", "poi_listen", "poi_complete", "qr_scan", "location_update" };
            var result = new Dictionary<string, long>();

            foreach (var type in eventTypes)
            {
                result[type] = await _events.CountDocumentsAsync(e => e.EventType == type);
            }

            return result;
        }

        /// <summary>Lấy số sessions unique</summary>
        public async Task<long> GetUniqueSessionsAsync()
        {
            var sessions = await _events.Distinct(e => e.SessionId, _ => true).ToListAsync();
            return sessions.Count;
        }

        /// <summary>Lấy sự kiện gần đây</summary>
        public async Task<List<AnalyticsEvent>> GetRecentEventsAsync(int limit = 50)
        {
            return await _events
                .Find(_ => true)
                .SortByDescending(e => e.Timestamp)
                .Limit(limit)
                .ToListAsync();
        }
    }
}
