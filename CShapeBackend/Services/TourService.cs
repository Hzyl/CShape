using MongoDB.Driver;
using CShapeBackend.Data;
using CShapeBackend.Models;
using CShapeBackend.Models.DTOs;

namespace CShapeBackend.Services
{
    public interface ITourService
    {
        Task<PaginatedResponse<TourResponse>> GetAllToursAsync(int page, int limit);
        Task<TourResponse?> GetTourByIdAsync(string id);
        Task<TourResponse> CreateTourAsync(CreateTourRequest request, string createdBy);
        Task<TourResponse?> UpdateTourAsync(string id, CreateTourRequest request);
        Task<bool> DeleteTourAsync(string id);
    }

    public class TourService : ITourService
    {
        private readonly MongoDbContext _context;
        private readonly ILogger<TourService> _logger;

        public TourService(MongoDbContext context, ILogger<TourService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PaginatedResponse<TourResponse>> GetAllToursAsync(int page, int limit)
        {
            var filter = Builders<Tour>.Filter.Eq(x => x.Status, "published");
            var total = (int)await _context.Tours.CountDocumentsAsync(filter);
            var skip = (page - 1) * limit;

            var tours = await _context.Tours
                .Find(filter)
                .SortByDescending(x => x.CreatedAt)
                .Skip(skip)
                .Limit(limit)
                .ToListAsync();

            return new PaginatedResponse<TourResponse>
            {
                Data = tours.Select(MapToResponse).ToList(),
                Total = total,
                Page = page,
                Limit = limit
            };
        }

        public async Task<TourResponse?> GetTourByIdAsync(string id)
        {
            var tour = await _context.Tours.Find(x => x.Id == id).FirstOrDefaultAsync();
            return tour == null ? null : MapToResponse(tour);
        }

        public async Task<TourResponse> CreateTourAsync(CreateTourRequest request, string createdBy)
        {
            ValidateTourRequest(request);

            var tour = new Tour
            {
                Name = request.Name,
                Description = request.Description,
                ThumbnailUrl = request.ThumbnailUrl,
                POIs = request.POIs.Select(p => new Models.TourPOI
                {
                    PoiId = p.PoiId,
                    OrderIndex = p.OrderIndex,
                    StopDurationMinutes = p.StopDurationMinutes
                }).ToList(),
                Status = "published",
                CreatedBy = createdBy,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Enrich POI names
            await EnrichTourPOINames(tour);

            // Calculate estimated duration
            tour.EstimatedDurationMinutes = CalculateEstimatedDuration(tour);

            await _context.Tours.InsertOneAsync(tour);
            _logger.LogInformation($"Tour created: {tour.Name} (ID: {tour.Id})");

            return MapToResponse(tour);
        }

        public async Task<TourResponse?> UpdateTourAsync(string id, CreateTourRequest request)
        {
            ValidateTourRequest(request);

            var tour = await _context.Tours.Find(x => x.Id == id).FirstOrDefaultAsync();
            if (tour == null)
                return null;

            tour.Name = request.Name;
            tour.Description = request.Description;
            tour.ThumbnailUrl = request.ThumbnailUrl;
            tour.POIs = request.POIs.Select(p => new Models.TourPOI
            {
                PoiId = p.PoiId,
                OrderIndex = p.OrderIndex,
                StopDurationMinutes = p.StopDurationMinutes
            }).ToList();
            tour.UpdatedAt = DateTime.UtcNow;

            await EnrichTourPOINames(tour);
            tour.EstimatedDurationMinutes = CalculateEstimatedDuration(tour);

            await _context.Tours.ReplaceOneAsync(x => x.Id == id, tour);
            _logger.LogInformation($"Tour updated: {tour.Name} (ID: {id})");

            return MapToResponse(tour);
        }

        public async Task<bool> DeleteTourAsync(string id)
        {
            var result = await _context.Tours.DeleteOneAsync(x => x.Id == id);
            if (result.DeletedCount > 0)
            {
                _logger.LogInformation($"Tour deleted: {id}");
            }
            return result.DeletedCount > 0;
        }

        private async Task EnrichTourPOINames(Tour tour)
        {
            foreach (var poiRef in tour.POIs)
            {
                var poi = await _context.POIs.Find(x => x.Id == poiRef.PoiId).FirstOrDefaultAsync();
                if (poi != null)
                {
                    poiRef.PoiName = poi.Name;
                }
            }
        }

        private int CalculateEstimatedDuration(Tour tour)
        {
            return tour.POIs.Sum(p => p.StopDurationMinutes) + (tour.POIs.Count - 1) * 5; // 5 min travel between POIs
        }

        private TourResponse MapToResponse(Tour tour)
        {
            return new TourResponse
            {
                Id = tour.Id ?? string.Empty,
                Name = tour.Name,
                Description = tour.Description,
                POIs = tour.POIs.Select(p => new TourPOIResponse
                {
                    PoiId = p.PoiId,
                    PoiName = p.PoiName,
                    OrderIndex = p.OrderIndex,
                    StopDurationMinutes = p.StopDurationMinutes
                }).ToList(),
                ThumbnailUrl = tour.ThumbnailUrl,
                Status = tour.Status,
                EstimatedDurationMinutes = tour.EstimatedDurationMinutes,
                CreatedAt = tour.CreatedAt,
                UpdatedAt = tour.UpdatedAt
            };
        }

        private void ValidateTourRequest(CreateTourRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                throw new ArgumentException("Tour name is required");
            if (request.POIs == null || request.POIs.Count == 0)
                throw new ArgumentException("Tour must contain at least 1 POI");
        }
    }

    public interface IAnalyticsService
    {
        Task LogEventAsync(string sessionId, string eventType, string? poiId = null, string? tourId = null, int duration = 0, string? deviceType = null);
        Task<AnalyticsSummaryResponse> GetSummaryAsync(string period = "7d");
        Task<List<TopPOIResponse>> GetTopPOIsAsync(int limit = 10, string period = "7d");
    }

    public class AnalyticsService : IAnalyticsService
    {
        private readonly MongoDbContext _context;
        private readonly ILogger<AnalyticsService> _logger;

        public AnalyticsService(MongoDbContext context, ILogger<AnalyticsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task LogEventAsync(string sessionId, string eventType, string? poiId = null, string? tourId = null, int duration = 0, string? deviceType = null)
        {
            var log = new AnalyticsLog
            {
                SessionId = sessionId,
                PoiId = poiId,
                TourId = tourId,
                EventType = eventType,
                DurationSeconds = duration,
                DeviceType = deviceType,
                Timestamp = DateTime.UtcNow
            };

            await _context.AnalyticsLogs.InsertOneAsync(log);
        }

        public async Task<AnalyticsSummaryResponse> GetSummaryAsync(string period = "7d")
        {
            var startDate = GetStartDate(period);
            var filter = Builders<AnalyticsLog>.Filter.Gte(x => x.Timestamp, startDate);

            var logs = await _context.AnalyticsLogs
                .Find(filter)
                .ToListAsync();

            var totalPlays = logs.Count(x => x.EventType.Contains("listened"));
            var uniqueSessions = logs.Select(x => x.SessionId).Distinct().Count();
            var avgDuration = logs.Any() ? (int)logs.Average(x => x.DurationSeconds) : 0;

            // Get top POI name
            var topPoi = logs
                .Where(x => !string.IsNullOrEmpty(x.PoiId))
                .GroupBy(x => x.PoiId)
                .OrderByDescending(g => g.Count())
                .FirstOrDefault();

            string topPoiName = "N/A";
            if (topPoi != null)
            {
                var poi = await _context.POIs.Find(x => x.Id == topPoi.Key).FirstOrDefaultAsync();
                if (poi != null)
                    topPoiName = poi.Name;
            }

            return new AnalyticsSummaryResponse
            {
                TotalPlays = totalPlays,
                UniqueSessions = uniqueSessions,
                AverageDuration = avgDuration,
                TopPoiName = topPoiName
            };
        }

        public async Task<List<TopPOIResponse>> GetTopPOIsAsync(int limit = 10, string period = "7d")
        {
            var startDate = GetStartDate(period);
            var filter = Builders<AnalyticsLog>.Filter.And(
                Builders<AnalyticsLog>.Filter.Gte(x => x.Timestamp, startDate),
                Builders<AnalyticsLog>.Filter.Exists(x => x.PoiId)
            );

            var logs = await _context.AnalyticsLogs
                .Find(filter)
                .ToListAsync();

            var topPoiIds = logs
                .GroupBy(x => x.PoiId)
                .OrderByDescending(g => g.Count())
                .Take(limit)
                .Select(g => g.Key)
                .ToList();

            var result = new List<TopPOIResponse>();
            foreach (var poiId in topPoiIds)
            {
                var poi = await _context.POIs.Find(x => x.Id == poiId).FirstOrDefaultAsync();
                var playCount = logs.Count(x => x.PoiId == poiId);

                if (poi != null)
                {
                    result.Add(new TopPOIResponse
                    {
                        PoiId = poiId!,
                        Name = poi.Name,
                        PlayCount = playCount
                    });
                }
            }

            return result;
        }

        private DateTime GetStartDate(string period)
        {
            return period switch
            {
                "today" => DateTime.UtcNow.Date,
                "7d" => DateTime.UtcNow.AddDays(-7),
                "30d" => DateTime.UtcNow.AddDays(-30),
                _ => DateTime.UtcNow.AddDays(-7)
            };
        }
    }
}
