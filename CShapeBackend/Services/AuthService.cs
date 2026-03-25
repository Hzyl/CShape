using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using CShapeBackend.Data;
using CShapeBackend.Models;
using CShapeBackend.Models.DTOs;
using BCrypt.Net;

namespace CShapeBackend.Services
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request);
        Task InitializeDefaultAdminAsync();
        Task<AdminUser?> GetUserByEmailAsync(string email);
    }

    public class AuthService : IAuthService
    {
        private readonly MongoDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(MongoDbContext context, IConfiguration configuration, ILogger<AuthService> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                throw new UnauthorizedAccessException("Email and password are required");

            var user = await GetUserByEmailAsync(request.Email);
            if (user == null)
                throw new UnauthorizedAccessException("Invalid email or password");

            // Check if account is locked
            if (user.LockedUntil.HasValue && user.LockedUntil > DateTime.UtcNow)
            {
                var remainingSeconds = (int)(user.LockedUntil.Value - DateTime.UtcNow).TotalSeconds;
                throw new UnauthorizedAccessException($"Account is locked. Try again in {remainingSeconds} seconds.");
            }

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                // Increment failed attempts
                user.FailedLoginAttempts++;
                if (user.FailedLoginAttempts >= 5)
                {
                    user.LockedUntil = DateTime.UtcNow.AddMinutes(5);
                }
                await _context.AdminUsers.ReplaceOneAsync(x => x.Id == user.Id, user);
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            // Reset failed attempts on successful login
            user.FailedLoginAttempts = 0;
            user.LockedUntil = null;
            user.LastLoginAt = DateTime.UtcNow;
            await _context.AdminUsers.ReplaceOneAsync(x => x.Id == user.Id, user);

            // Generate JWT token
            var token = GenerateJwtToken(user);

            return new LoginResponse
            {
                AccessToken = token,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role,
                ExpiresAt = DateTime.UtcNow.AddMinutes(
                    _configuration.GetValue<int>("Jwt:ExpirationMinutes", 60)
                )
            };
        }

        public async Task InitializeDefaultAdminAsync()
        {
            var defaultEmail = _configuration.GetValue<string>("AdminDefaults:Email") ?? "admin@vinh-khanh.local";
            var defaultPassword = _configuration.GetValue<string>("AdminDefaults:Password") ?? "password";

            // Check if admin exists
            var existingAdmin = await GetUserByEmailAsync(defaultEmail);
            if (existingAdmin != null)
                return;

            // Create default admin
            var admin = new AdminUser
            {
                Email = defaultEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword),
                FullName = "System Admin",
                Role = "admin",
                IsActive = true
            };

            await _context.AdminUsers.InsertOneAsync(admin);
            _logger.LogInformation($"Default admin user created: {defaultEmail}");
        }

        public async Task<AdminUser?> GetUserByEmailAsync(string email)
        {
            return await _context.AdminUsers.Find(x => x.Email == email).FirstOrDefaultAsync();
        }

        private string GenerateJwtToken(AdminUser user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var secretKey = jwtSettings.GetValue<string>("SecretKey");
            var expirationMinutes = jwtSettings.GetValue<int>("ExpirationMinutes", 60);
            var issuer = jwtSettings.GetValue<string>("Issuer");
            var audience = jwtSettings.GetValue<string>("Audience");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id ?? string.Empty),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim("role", user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public interface IPOIService
    {
        Task<PaginatedResponse<POIResponse>> GetAllPOIsAsync(int page, int limit, string? search = null, string? type = null);
        Task<POIResponse?> GetPOIByIdAsync(string id);
        Task<POIResponse> CreatePOIAsync(CreatePOIRequest request, string createdBy);
        Task<POIResponse?> UpdatePOIAsync(string id, UpdatePOIRequest request);
        Task<bool> DeletePOIAsync(string id);
        Task<List<POIResponse>> GetNearbyPOIsAsync(double latitude, double longitude, int radiusMeters = 1000);
    }

    public class POIService : IPOIService
    {
        private readonly MongoDbContext _context;
        private readonly ILogger<POIService> _logger;

        public POIService(MongoDbContext context, ILogger<POIService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PaginatedResponse<POIResponse>> GetAllPOIsAsync(int page, int limit, string? search = null, string? type = null)
        {
            var filter = Builders<POI>.Filter.Empty;

            if (!string.IsNullOrWhiteSpace(search))
            {
                filter &= Builders<POI>.Filter.Regex(x => x.Name, search);
            }

            if (!string.IsNullOrWhiteSpace(type))
            {
                filter &= Builders<POI>.Filter.Eq(x => x.Type, type);
            }

            var total = (int)await _context.POIs.CountDocumentsAsync(filter);
            var skip = (page - 1) * limit;

            var pois = await _context.POIs
                .Find(filter)
                .Skip(skip)
                .Limit(limit)
                .ToListAsync();

            return new PaginatedResponse<POIResponse>
            {
                Data = pois.Select(MapToResponse).ToList(),
                Total = total,
                Page = page,
                Limit = limit
            };
        }

        public async Task<POIResponse?> GetPOIByIdAsync(string id)
        {
            var poi = await _context.POIs.Find(x => x.Id == id).FirstOrDefaultAsync();
            return poi == null ? null : MapToResponse(poi);
        }

        public async Task<POIResponse> CreatePOIAsync(CreatePOIRequest request, string createdBy)
        {
            ValidatePOIRequest(request);

            var poi = new POI
            {
                Name = request.Name,
                Type = request.Type,
                Category = request.Category,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                TriggerRadius = request.TriggerRadius,
                Priority = request.Priority,
                DescriptionVi = request.DescriptionVi,
                DescriptionEn = request.DescriptionEn,
                DescriptionJp = request.DescriptionJp,
                ImageUrls = request.ImageUrls ?? new(),
                QrCodeHash = GenerateQrHash(),
                CreatedBy = createdBy,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.POIs.InsertOneAsync(poi);
            _logger.LogInformation($"POI created: {poi.Name} (ID: {poi.Id})");

            return MapToResponse(poi);
        }

        public async Task<POIResponse?> UpdatePOIAsync(string id, UpdatePOIRequest request)
        {
            ValidatePOIRequest(request);

            var poi = await _context.POIs.Find(x => x.Id == id).FirstOrDefaultAsync();
            if (poi == null)
                return null;

            poi.Name = request.Name;
            poi.Type = request.Type;
            poi.Category = request.Category;
            poi.Latitude = request.Latitude;
            poi.Longitude = request.Longitude;
            poi.TriggerRadius = request.TriggerRadius;
            poi.Priority = request.Priority;
            poi.DescriptionVi = request.DescriptionVi;
            poi.DescriptionEn = request.DescriptionEn;
            poi.DescriptionJp = request.DescriptionJp;
            poi.ImageUrls = request.ImageUrls ?? new();
            poi.UpdatedAt = DateTime.UtcNow;

            await _context.POIs.ReplaceOneAsync(x => x.Id == id, poi);
            _logger.LogInformation($"POI updated: {poi.Name} (ID: {id})");

            return MapToResponse(poi);
        }

        public async Task<bool> DeletePOIAsync(string id)
        {
            var result = await _context.POIs.DeleteOneAsync(x => x.Id == id);
            if (result.DeletedCount > 0)
            {
                _logger.LogInformation($"POI deleted: {id}");
            }
            return result.DeletedCount > 0;
        }

        public async Task<List<POIResponse>> GetNearbyPOIsAsync(double latitude, double longitude, int radiusMeters = 1000)
        {
            // Simple distance-based filtering (not using geospatial index for POC)
            var allPois = await _context.POIs.Find(Builders<POI>.Filter.Empty).ToListAsync();

            var nearbyPois = allPois
                .Where(p => CalculateDistance(latitude, longitude, p.Latitude, p.Longitude) <= radiusMeters)
                .OrderBy(p => CalculateDistance(latitude, longitude, p.Latitude, p.Longitude))
                .Select(MapToResponse)
                .ToList();

            return nearbyPois;
        }

        private POIResponse MapToResponse(POI poi)
        {
            return new POIResponse
            {
                Id = poi.Id ?? string.Empty,
                Name = poi.Name,
                Type = poi.Type,
                Category = poi.Category,
                Latitude = poi.Latitude,
                Longitude = poi.Longitude,
                TriggerRadius = poi.TriggerRadius,
                Priority = poi.Priority,
                DescriptionVi = poi.DescriptionVi,
                DescriptionEn = poi.DescriptionEn,
                DescriptionJp = poi.DescriptionJp,
                ImageUrls = poi.ImageUrls,
                AudioStatus = poi.AudioStatus,
                AudioUrl = poi.AudioUrl,
                QrCodeHash = poi.QrCodeHash,
                CreatedAt = poi.CreatedAt,
                UpdatedAt = poi.UpdatedAt
            };
        }

        private void ValidatePOIRequest(CreatePOIRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                throw new ArgumentException("Name is required");
            if (request.Latitude < -90 || request.Latitude > 90)
                throw new ArgumentException("Invalid latitude");
            if (request.Longitude < -180 || request.Longitude > 180)
                throw new ArgumentException("Invalid longitude");
            if (string.IsNullOrWhiteSpace(request.DescriptionVi))
                throw new ArgumentException("Vietnamese description is required");
        }

        private string GenerateQrHash()
        {
            return "qr-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
        }

        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371000; // Earth's radius in meters
            var phi1 = lat1 * Math.PI / 180;
            var phi2 = lat2 * Math.PI / 180;
            var deltaPhi = (lat2 - lat1) * Math.PI / 180;
            var deltaLambda = (lon2 - lon1) * Math.PI / 180;

            var a = Math.Sin(deltaPhi / 2) * Math.Sin(deltaPhi / 2) +
                    Math.Cos(phi1) * Math.Cos(phi2) * Math.Sin(deltaLambda / 2) * Math.Sin(deltaLambda / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return R * c;
        }
    }
}
