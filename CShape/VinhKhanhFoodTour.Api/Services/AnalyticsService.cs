using MongoDB.Bson;
using MongoDB.Driver;
using VinhKhanhFoodTour.Api.Models;

namespace VinhKhanhFoodTour.Api.Services
{
    public class AnalyticsService
    {
        private readonly IMongoCollection<AnalyticsEvent> _events;
        private readonly IMongoCollection<Poi> _pois;

        public AnalyticsService(IMongoDatabase database)
        {
            _events = database.GetCollection<AnalyticsEvent>("analytics");
            _pois = database.GetCollection<Poi>("pois");
        }

        public async Task<AnalyticsEvent> TrackEventAsync(AnalyticsEvent ev)
        {
            ev.Id ??= ObjectId.GenerateNewId().ToString();
            ev.Timestamp = DateTime.UtcNow;
            await _events.InsertOneAsync(ev);
            return ev;
        }

        public async Task<List<PoiStats>> GetTopPoiStatsAsync(int limit = 10)
        {
            var safeLimit = Math.Clamp(limit, 1, 50);
            var stats = await _events.Aggregate()
                .Match(e => e.EventType == "poi_listen" && e.PoiId != null)
                .Group(e => e.PoiId, g => new PoiStats
                {
                    PoiId = g.Key!,
                    ListenCount = g.Count(),
                    AvgDuration = g.Average(e => e.Duration ?? 0)
                })
                .SortByDescending(s => s.ListenCount)
                .Limit(safeLimit)
                .ToListAsync();

            await FillPoiNamesAsync(stats);
            return stats;
        }

        public async Task<List<HeatmapPoint>> GetHeatmapDataAsync()
        {
            var events = await _events.Find(_ => true).ToListAsync();
            var poiLookup = await LoadPoiLookupAsync(events.Select(e => e.PoiId));

            var points = events
                .Select(e =>
                {
                    if (e.Latitude.HasValue && e.Longitude.HasValue)
                    {
                        return new HeatPoint(e.Latitude.Value, e.Longitude.Value);
                    }

                    if (!string.IsNullOrWhiteSpace(e.PoiId) && poiLookup.TryGetValue(e.PoiId, out var poi))
                    {
                        return new HeatPoint(poi.Latitude, poi.Longitude);
                    }

                    return null;
                })
                .Where(p => p != null)
                .Select(p => p!)
                .ToList();

            if (points.Count == 0)
            {
                var activePois = await _pois.Find(p => p.IsActive).SortBy(p => p.Priority).Limit(50).ToListAsync();
                points = activePois
                    .Where(p => p.Latitude != 0 && p.Longitude != 0)
                    .Select(p => new HeatPoint(p.Latitude, p.Longitude))
                    .ToList();
            }

            return points
                .GroupBy(p => new
                {
                    Lat = Math.Round(p.Latitude, 4),
                    Lng = Math.Round(p.Longitude, 4)
                })
                .Select(g => new HeatmapPoint
                {
                    Latitude = g.Key.Lat,
                    Longitude = g.Key.Lng,
                    Intensity = g.Count()
                })
                .ToList();
        }

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

        public async Task<long> GetUniqueSessionsAsync()
        {
            var sessions = await _events.Distinct(e => e.SessionId, _ => true).ToListAsync();
            return sessions.Count(s => !string.IsNullOrWhiteSpace(s));
        }

        public async Task<List<AnalyticsEvent>> GetRecentEventsAsync(int limit = 50)
        {
            return await _events
                .Find(_ => true)
                .SortByDescending(e => e.Timestamp)
                .Limit(Math.Clamp(limit, 1, 200))
                .ToListAsync();
        }

        private async Task FillPoiNamesAsync(List<PoiStats> stats)
        {
            var poiLookup = await LoadPoiLookupAsync(stats.Select(s => s.PoiId));
            foreach (var stat in stats)
            {
                if (poiLookup.TryGetValue(stat.PoiId, out var poi))
                {
                    stat.PoiName = poi.Name.GetValueOrDefault("vi")
                        ?? poi.Name.GetValueOrDefault("en")
                        ?? stat.PoiId;
                }
            }
        }

        private async Task<Dictionary<string, Poi>> LoadPoiLookupAsync(IEnumerable<string?> ids)
        {
            var validIds = ids
                .Where(id => !string.IsNullOrWhiteSpace(id) && ObjectId.TryParse(id, out _))
                .Select(id => id!)
                .Distinct()
                .ToList();

            if (validIds.Count == 0) return new Dictionary<string, Poi>();

            var pois = await _pois.Find(p => p.Id != null && validIds.Contains(p.Id)).ToListAsync();
            return pois
                .Where(p => p.Id != null)
                .ToDictionary(p => p.Id!, p => p);
        }

        private sealed record HeatPoint(double Latitude, double Longitude);
    }
}
