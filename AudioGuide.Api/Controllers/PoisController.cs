// File: AudioGuide.Api/Controllers/PoisController.cs
using Microsoft.AspNetCore.Mvc;
using AudioGuide.Api.Models.Dtos;
using AudioGuide.Api.Services;

namespace AudioGuide.Api.Controllers
{
    /// <summary>
    /// Controller xử lý các API endpoint liên quan đến POI (Point of Interest)
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class PoisController : ControllerBase
    {
        private readonly IPoiService _poiService;
        private readonly ILogger<PoisController> _logger;

        public PoisController(IPoiService poiService, ILogger<PoisController> logger)
        {
            _poiService = poiService;
            _logger = logger;
        }

        /// <summary>
        /// Tìm danh sách POI gần vị trí hiện tại
        /// </summary>
        /// <param name="lat">Vĩ độ của người dùng</param>
        /// <param name="lng">Kinh độ của người dùng</param>
        /// <param name="radius">Bán kính tìm kiếm (mét), mặc định 5000m</param>
        /// <returns>Danh sách POI gần vị trí</returns>
        /// <remarks>
        /// Ví dụ: GET /api/pois/nearby?lat=21.0285&lng=105.8542&radius=5000
        /// </remarks>
        [HttpGet("nearby")]
        [ProducesResponseType(typeof(List<PoiMapDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<PoiMapDto>>> GetNearbyPois(
            [FromQuery] decimal lat,
            [FromQuery] decimal lng,
            [FromQuery] int radius = 5000)
        {
            try
            {
                // Validate input
                if (lat < -90 || lat > 90 || lng < -180 || lng > 180)
                {
                    _logger.LogWarning($"Tọa độ GPS không hợp lệ: lat={lat}, lng={lng}");
                    return BadRequest(new { message = "Tọa độ GPS không hợp lệ. Vĩ độ phải từ -90 đến 90, kinh độ từ -180 đến 180" });
                }

                if (radius <= 0)
                {
                    _logger.LogWarning($"Bán kính tìm kiếm không hợp lệ: {radius}");
                    return BadRequest(new { message = "Bán kính tìm kiếm phải lớn hơn 0" });
                }

                _logger.LogInformation($"Tìm POI gần vị trí: lat={lat}, lng={lng}, radius={radius}m");
                var nearbyPois = await _poiService.GetNearbyPoisAsync(lat, lng, radius);

                if (!nearbyPois.Any())
                {
                    _logger.LogInformation($"Không tìm thấy POI nào trong bán kính {radius}m");
                }

                return Ok(new
                {
                    success = true,
                    message = $"Tìm thấy {nearbyPois.Count} điểm du lịch",
                    data = nearbyPois,
                    userLocation = new { latitude = lat, longitude = lng },
                    searchRadius = radius
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tìm kiếm POI gần vị trí");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { success = false, message = "Lỗi máy chủ khi tìm kiếm POI" });
            }
        }

        /// <summary>
        /// Lấy chi tiết POI với hỗ trợ đa ngôn ngữ
        /// </summary>
        /// <param name="poiId">ID của POI</param>
        /// <param name="lang">Mã ngôn ngữ yêu cầu (mặc định "vi")</param>
        /// <returns>Chi tiết POI với nội dung thuyết minh</returns>
        /// <remarks>
        /// Ví dụ: GET /api/pois/{poiId}?lang=en
        /// Quy tắc Fallback: Nếu ngôn ngữ yêu cầu không có, API sẽ tự động trả về Tiếng Anh
        /// </remarks>
        [HttpGet("{poiId:guid}")]
        [ProducesResponseType(typeof(PoiDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PoiDetailDto>> GetPoiDetail(
            [FromRoute] Guid poiId,
            [FromQuery] string lang = "vi")
        {
            try
            {
                if (poiId == Guid.Empty)
                {
                    _logger.LogWarning("POI ID không hợp lệ");
                    return BadRequest(new { message = "POI ID không hợp lệ" });
                }

                // Sanitize language code
                lang = string.IsNullOrWhiteSpace(lang) ? "vi" : lang.Trim().ToLower();

                _logger.LogInformation($"Lấy chi tiết POI: poiId={poiId}, language={lang}");
                var poiDetail = await _poiService.GetPoiDetailAsync(poiId, lang);

                if (poiDetail == null)
                {
                    _logger.LogWarning($"Không tìm thấy POI: {poiId}");
                    return NotFound(new { message = $"Không tìm thấy điểm du lịch với ID: {poiId}" });
                }

                return Ok(new
                {
                    success = true,
                    message = "Lấy thông tin chi tiết thành công",
                    data = poiDetail,
                    languageUsed = poiDetail.LanguageCode,
                    fallbackWarning = poiDetail.LanguageFallbackNote
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy chi tiết POI: {poiId}");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { success = false, message = "Lỗi máy chủ khi lấy thông tin POI" });
            }
        }

        /// <summary>
        /// Lấy POI thông qua QR Code Hash
        /// </summary>
        /// <param name="qrHash">Mã băm QR Code</param>
        /// <param name="lang">Mã ngôn ngữ yêu cầu (mặc định "vi")</param>
        /// <returns>Chi tiết POI được quét qua QR</returns>
        /// <remarks>
        /// Ví dụ: GET /api/pois/qr/abc123def456?lang=jp
        /// Dùng để xử lý việc quét QR code trên hiện trường
        /// </remarks>
        [HttpGet("qr/{qrHash}")]
        [ProducesResponseType(typeof(PoiDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PoiDetailDto>> GetPoiByQrCode(
            [FromRoute] string qrHash,
            [FromQuery] string lang = "vi")
        {
            try
            {
                if (string.IsNullOrWhiteSpace(qrHash))
                {
                    _logger.LogWarning("QR Code Hash không được để trống");
                    return BadRequest(new { message = "QR Code Hash không được để trống" });
                }

                // Sanitize language code
                lang = string.IsNullOrWhiteSpace(lang) ? "vi" : lang.Trim().ToLower();

                _logger.LogInformation($"Lấy POI từ QR Code: qrHash={qrHash}, language={lang}");
                var poiDetail = await _poiService.GetPoiByQrCodeHashAsync(qrHash, lang);

                if (poiDetail == null)
                {
                    _logger.LogWarning($"Không tìm thấy POI với QR Hash: {qrHash}");
                    return NotFound(new
                    {
                        message = "QR Code này không được hệ thống nhận diện. Vui lòng kiểm tra lại QR Code."
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Quét QR Code thành công",
                    data = poiDetail,
                    languageUsed = poiDetail.LanguageCode,
                    fallbackWarning = poiDetail.LanguageFallbackNote
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi lấy POI từ QR Code: {qrHash}");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { success = false, message = "Lỗi máy chủ khi xử lý QR Code" });
            }
        }

        /// <summary>
        /// Health check endpoint - kiểm tra API có hoạt động không
        /// </summary>
        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new { message = "API Audio Guide đang hoạt động bình thường 🎧" });
        }
    }
}
