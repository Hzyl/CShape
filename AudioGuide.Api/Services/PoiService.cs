// File: AudioGuide.Api/Services/PoiService.cs
using Microsoft.EntityFrameworkCore;
using AudioGuide.Api.Data;
using AudioGuide.Api.Models;
using AudioGuide.Api.Models.Dtos;
using AudioGuide.Api.Helpers;

namespace AudioGuide.Api.Services
{
    /// <summary>
    /// Service xử lý business logic liên quan đến POI (Point of Interest)
    /// Bao gồm: Tìm kiếm POI gần vị trí, lấy chi tiết POI với fallback ngôn ngữ, xử lý QR code
    /// </summary>
    public interface IPoiService
    {
        /// <summary>
        /// Tìm danh sách POI gần vị trí hiện tại
        /// </summary>
        /// <param name="latitude">Vĩ độ của người dùng</param>
        /// <param name="longitude">Kinh độ của người dùng</param>
        /// <param name="radiusInMeters">Bán kính tìm kiếm (mét), default 5000m</param>
        /// <returns>Danh sách POI gần vị trí được sắp xếp theo khoảng cách</returns>
        Task<List<PoiMapDto>> GetNearbyPoisAsync(decimal latitude, decimal longitude, int radiusInMeters = 5000);

        /// <summary>
        /// Lấy chi tiết POI với hỗ trợ đa ngôn ngữ
        /// Quy tắc Fallback: Nếu ngôn ngữ yêu cầu không có, trả về Tiếng Anh
        /// </summary>
        /// <param name="poiId">ID của POI</param>
        /// <param name="languageCode">Mã ngôn ngữ yêu cầu (vi, en, jp, ...)</param>
        /// <returns>Chi tiết POI với audio content theo ngôn ngữ</returns>
        Task<PoiDetailDto?> GetPoiDetailAsync(Guid poiId, string languageCode = "vi");

        /// <summary>
        /// Lấy POI thông qua QR Code Hash
        /// </summary>
        /// <param name="qrCodeHash">Mã băm QR code</param>
        /// <param name="languageCode">Mã ngôn ngữ yêu cầu</param>
        /// <returns>Chi tiết POI được quét qua QR</returns>
        Task<PoiDetailDto?> GetPoiByQrCodeHashAsync(string qrCodeHash, string languageCode = "vi");
    }

    /// <inheritdoc/>
    public class PoiService : IPoiService
    {
        private readonly AppDbContext _dbContext;

        public PoiService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<PoiMapDto>> GetNearbyPoisAsync(decimal latitude, decimal longitude, int radiusInMeters = 5000)
        {
            try
            {
                // Tính toán bounding box để giảm số lượng POI cần tính toán (Bounding Box Optimization)
                var (minLat, maxLat, minLng, maxLng) = GeoHelper.CalculateBoundingBox(latitude, longitude, radiusInMeters);

                // Lấy danh sách POI trong bounding box
                var pois = await _dbContext.PointsOfInterest
                    .Where(p => p.Latitude >= minLat && p.Latitude <= maxLat &&
                                p.Longitude >= minLng && p.Longitude <= maxLng)
                    .Include(p => p.AudioContents)
                    .ToListAsync();

                // Tính toán khoảng cách và lọc POI gần hơn radiusInMeters
                var nearbyPois = pois
                    .AsEnumerable()
                    .Select(p => new
                    {
                        Poi = p,
                        Distance = GeoHelper.CalculateDistanceInMeters(latitude, longitude, p.Latitude, p.Longitude)
                    })
                    .Where(x => x.Distance <= radiusInMeters)
                    .OrderBy(x => x.Distance) // Sắp xếp theo khoảng cách gần nhất
                    .ThenByDescending(x => x.Poi.Priority) // Nếu khoảng cách bằng nhau, ưu tiên POI có Priority cao
                    .Select(x => new PoiMapDto
                    {
                        PoiId = x.Poi.PoiId,
                        Name = x.Poi.Name,
                        Latitude = x.Poi.Latitude,
                        Longitude = x.Poi.Longitude,
                        ImageUrl = x.Poi.ImageUrl,
                        DistanceInMeters = x.Distance,
                        TriggerRadius = x.Poi.TriggerRadius,
                        Priority = x.Poi.Priority,
                        AvailableLanguagesCount = x.Poi.AudioContents.Select(a => a.LanguageCode).Distinct().Count()
                    })
                    .ToList();

                return nearbyPois;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi tìm kiếm POI gần vị trí: {ex.Message}");
                throw;
            }
        }

        public async Task<PoiDetailDto?> GetPoiDetailAsync(Guid poiId, string languageCode = "vi")
        {
            try
            {
                var poi = await _dbContext.PointsOfInterest
                    .Include(p => p.AudioContents)
                    .FirstOrDefaultAsync(p => p.PoiId == poiId);

                if (poi == null)
                {
                    Console.WriteLine($"Không tìm thấy POI với ID: {poiId}");
                    return null;
                }

                // **Quy tắc Fallback Ngôn Ngữ:**
                // 1. Tìm nội dung theo ngôn ngữ yêu cầu
                // 2. Nếu không có, tìm Tiếng Anh ("en")
                // 3. Nếu không có Tiếng Anh, lấy ngôn ngữ đầu tiên có sẵn

                var audioContent = poi.AudioContents.FirstOrDefault(a => a.LanguageCode == languageCode);

                if (audioContent == null)
                {
                    // Fallback sang Tiếng Anh
                    audioContent = poi.AudioContents.FirstOrDefault(a => a.LanguageCode == "en");

                    if (audioContent == null && poi.AudioContents.Count > 0)
                    {
                        // Nếu không có Tiếng Anh, lấy ngôn ngữ đầu tiên
                        audioContent = poi.AudioContents.First();
                    }
                }

                if (audioContent == null)
                {
                    Console.WriteLine($"Không tìm thấy nội dung thuyết minh cho POI: {poiId}");
                    return null;
                }

                var fallbackNote = audioContent.LanguageCode != languageCode
                    ? $"Ngôn ngữ '{languageCode}' không có sẵn, đã sử dụng '{audioContent.LanguageCode}'"
                    : null;

                return new PoiDetailDto
                {
                    PoiId = poi.PoiId,
                    Name = poi.Name,
                    Latitude = poi.Latitude,
                    Longitude = poi.Longitude,
                    TriggerRadius = poi.TriggerRadius,
                    Priority = poi.Priority,
                    ImageUrl = poi.ImageUrl,
                    LanguageCode = audioContent.LanguageCode,
                    TextDescription = audioContent.TextDescription,
                    AudioUrl = audioContent.AudioUrl,
                    DurationInSeconds = audioContent.DurationInSeconds,
                    RequestedLanguage = languageCode,
                    LanguageFallbackNote = fallbackNote
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi lấy chi tiết POI: {ex.Message}");
                throw;
            }
        }

        public async Task<PoiDetailDto?> GetPoiByQrCodeHashAsync(string qrCodeHash, string languageCode = "vi")
        {
            try
            {
                if (string.IsNullOrWhiteSpace(qrCodeHash))
                {
                    Console.WriteLine("QR Code Hash không được để trống");
                    return null;
                }

                var poi = await _dbContext.PointsOfInterest
                    .Include(p => p.AudioContents)
                    .FirstOrDefaultAsync(p => p.QrCodeHash == qrCodeHash);

                if (poi == null)
                {
                    Console.WriteLine($"Không tìm thấy POI với QR Code Hash: {qrCodeHash}");
                    return null;
                }

                // Sử dụng cùng logic fallback ngôn ngữ như GetPoiDetailAsync
                return await GetPoiDetailAsync(poi.PoiId, languageCode);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi lấy POI bằng QR Code: {ex.Message}");
                throw;
            }
        }
    }
}
