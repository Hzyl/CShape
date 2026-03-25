namespace CShapeBackend.Models.DTOs
{
    // ============ Auth DTOs ============
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }

    // ============ POI DTOs ============
    public class CreatePOIRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = "major";
        public string? Category { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int TriggerRadius { get; set; } = 30;
        public int Priority { get; set; } = 1;
        public string DescriptionVi { get; set; } = string.Empty;
        public string? DescriptionEn { get; set; }
        public string? DescriptionJp { get; set; }
        public List<string>? ImageUrls { get; set; }
    }

    public class UpdatePOIRequest : CreatePOIRequest
    {
    }

    public class POIResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string? Category { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int TriggerRadius { get; set; }
        public int Priority { get; set; }
        public string DescriptionVi { get; set; } = string.Empty;
        public string? DescriptionEn { get; set; }
        public string? DescriptionJp { get; set; }
        public List<string>? ImageUrls { get; set; }
        public string AudioStatus { get; set; } = string.Empty;
        public string? AudioUrl { get; set; }
        public string QrCodeHash { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    // ============ Tour DTOs ============
    public class CreateTourRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<TourPOIRequest> POIs { get; set; } = new();
        public string? ThumbnailUrl { get; set; }
    }

    public class TourPOIRequest
    {
        public string PoiId { get; set; } = string.Empty;
        public int OrderIndex { get; set; } = 0;
        public int StopDurationMinutes { get; set; } = 10;
    }

    public class TourResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<TourPOIResponse> POIs { get; set; } = new();
        public string? ThumbnailUrl { get; set; }
        public string Status { get; set; } = string.Empty;
        public int EstimatedDurationMinutes { get; set; } = 0;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class TourPOIResponse
    {
        public string PoiId { get; set; } = string.Empty;
        public string PoiName { get; set; } = string.Empty;
        public int OrderIndex { get; set; } = 0;
        public int StopDurationMinutes { get; set; } = 10;
    }

    // ============ Analytics DTOs ============
    public class AnalyticsSummaryResponse
    {
        public int TotalPlays { get; set; }
        public int UniqueSessions { get; set; }
        public int AverageDuration { get; set; }
        public string TopPoiName { get; set; } = string.Empty;
    }

    public class TopPOIResponse
    {
        public string PoiId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int PlayCount { get; set; }
    }

    // ============ Generic DTOs ============
    public class ApiResponse<T>
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
    }

    public class PaginatedResponse<T>
    {
        public List<T> Data { get; set; } = new();
        public int Total { get; set; }
        public int Page { get; set; }
        public int Limit { get; set; }
    }
}
