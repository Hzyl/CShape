using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CShapeBackend.Models.DTOs;
using CShapeBackend.Services;

namespace CShapeBackend.Controllers
{
    [ApiController]
    [Route("api/v1/admin")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("auth/login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var response = await _authService.LoginAsync(request);
                return Ok(new ApiResponse<LoginResponse>
                {
                    Success = true,
                    Data = response,
                    Message = "Login successful"
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning($"Login failed: {ex.Message}");
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Login error: {ex.Message}");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred during login"
                });
            }
        }

        [HttpPost("auth/logout")]
        [Authorize]
        public IActionResult Logout()
        {
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Logout successful"
            });
        }

        [HttpGet("profile")]
        [Authorize]
        public IActionResult GetProfile()
        {
            var email = User.FindFirst("email")?.Value;
            var name = User.FindFirst("unique_name")?.Value;
            var role = User.FindFirst("role")?.Value;

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = new { email, name, role }
            });
        }
    }

    [ApiController]
    [Route("api/v1/poi")]
    [Authorize]
    public class POIController : ControllerBase
    {
        private readonly IPOIService _poiService;
        private readonly ILogger<POIController> _logger;

        public POIController(IPOIService poiService, ILogger<POIController> logger)
        {
            _poiService = poiService;
            _logger = logger;
        }

        [HttpGet("load-all")]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 20,
            [FromQuery] string? search = null,
            [FromQuery] string? type = null)
        {
            try
            {
                var result = await _poiService.GetAllPOIsAsync(page, limit, search, type);
                return Ok(new ApiResponse<PaginatedResponse<POIResponse>>
                {
                    Success = true,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching POIs: {ex.Message}");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Error fetching POIs"
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            try
            {
                var poi = await _poiService.GetPOIByIdAsync(id);
                if (poi == null)
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "POI not found"
                    });

                return Ok(new ApiResponse<POIResponse>
                {
                    Success = true,
                    Data = poi
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching POI: {ex.Message}");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Error fetching POI"
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePOIRequest request)
        {
            try
            {
                var createdBy = User.FindFirst("email")?.Value ?? "system";
                var poi = await _poiService.CreatePOIAsync(request, createdBy);
                return CreatedAtAction(nameof(GetById), new { id = poi.Id }, new ApiResponse<POIResponse>
                {
                    Success = true,
                    Data = poi,
                    Message = "POI created successfully"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating POI: {ex.Message}");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Error creating POI"
                });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdatePOIRequest request)
        {
            try
            {
                var poi = await _poiService.UpdatePOIAsync(id, request);
                if (poi == null)
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "POI not found"
                    });

                return Ok(new ApiResponse<POIResponse>
                {
                    Success = true,
                    Data = poi,
                    Message = "POI updated successfully"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating POI: {ex.Message}");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Error updating POI"
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var success = await _poiService.DeletePOIAsync(id);
                if (!success)
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "POI not found"
                    });

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "POI deleted successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting POI: {ex.Message}");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Error deleting POI"
                });
            }
        }

        [HttpGet("nearby")]
        [AllowAnonymous]
        public async Task<IActionResult> GetNearby(
            [FromQuery] double latitude,
            [FromQuery] double longitude,
            [FromQuery] int radius = 1000)
        {
            try
            {
                var pois = await _poiService.GetNearbyPOIsAsync(latitude, longitude, radius);
                return Ok(new ApiResponse<List<POIResponse>>
                {
                    Success = true,
                    Data = pois
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching nearby POIs: {ex.Message}");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Error fetching nearby POIs"
                });
            }
        }

        [HttpGet("qr/{hash}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByQRHash(string hash)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(hash))
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "QR hash cannot be empty"
                    });

                var poi = await _poiService.GetPOIByQRHashAsync(hash);
                if (poi == null)
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "POI not found for the given QR code"
                    });

                return Ok(new ApiResponse<POIResponse>
                {
                    Success = true,
                    Data = poi
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching POI by QR hash: {ex.Message}");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Error fetching POI by QR hash"
                });
            }
        }
    }

    [ApiController]
    [Route("api/v1/tours")]
    [Authorize]
    public class TourController : ControllerBase
    {
        private readonly ITourService _tourService;
        private readonly ILogger<TourController> _logger;

        public TourController(ITourService tourService, ILogger<TourController> logger)
        {
            _tourService = tourService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 20)
        {
            try
            {
                var result = await _tourService.GetAllToursAsync(page, limit);
                return Ok(new ApiResponse<PaginatedResponse<TourResponse>>
                {
                    Success = true,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching tours: {ex.Message}");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Error fetching tours"
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            try
            {
                var tour = await _tourService.GetTourByIdAsync(id);
                if (tour == null)
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Tour not found"
                    });

                return Ok(new ApiResponse<TourResponse>
                {
                    Success = true,
                    Data = tour
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching tour: {ex.Message}");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Error fetching tour"
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTourRequest request)
        {
            try
            {
                var createdBy = User.FindFirst("email")?.Value ?? "system";
                var tour = await _tourService.CreateTourAsync(request, createdBy);
                return CreatedAtAction(nameof(GetById), new { id = tour.Id }, new ApiResponse<TourResponse>
                {
                    Success = true,
                    Data = tour,
                    Message = "Tour created successfully"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating tour: {ex.Message}");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Error creating tour"
                });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] CreateTourRequest request)
        {
            try
            {
                var tour = await _tourService.UpdateTourAsync(id, request);
                if (tour == null)
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Tour not found"
                    });

                return Ok(new ApiResponse<TourResponse>
                {
                    Success = true,
                    Data = tour,
                    Message = "Tour updated successfully"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating tour: {ex.Message}");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Error updating tour"
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var success = await _tourService.DeleteTourAsync(id);
                if (!success)
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Tour not found"
                    });

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Tour deleted successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting tour: {ex.Message}");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Error deleting tour"
                });
            }
        }
    }

    [ApiController]
    [Route("api/v1/analytics")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(IAnalyticsService analyticsService, ILogger<AnalyticsController> logger)
        {
            _analyticsService = analyticsService;
            _logger = logger;
        }

        [HttpPost("log-event")]
        [AllowAnonymous]
        public async Task<IActionResult> LogEvent([FromBody] dynamic request)
        {
            try
            {
                await _analyticsService.LogEventAsync(
                    request.sessionId,
                    request.eventType,
                    request.poiId,
                    request.tourId,
                    request.duration ?? 0,
                    request.deviceType
                );
                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Event logged"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error logging event: {ex.Message}");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Error logging event"
                });
            }
        }

        [HttpGet("summary")]
        [Authorize]
        public async Task<IActionResult> GetSummary([FromQuery] string period = "7d")
        {
            try
            {
                var summary = await _analyticsService.GetSummaryAsync(period);
                return Ok(new ApiResponse<AnalyticsSummaryResponse>
                {
                    Success = true,
                    Data = summary
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching summary: {ex.Message}");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Error fetching summary"
                });
            }
        }

        [HttpGet("top-pois")]
        [Authorize]
        public async Task<IActionResult> GetTopPOIs(
            [FromQuery] int limit = 10,
            [FromQuery] string period = "7d")
        {
            try
            {
                var topPois = await _analyticsService.GetTopPOIsAsync(limit, period);
                return Ok(new ApiResponse<List<TopPOIResponse>>
                {
                    Success = true,
                    Data = topPois
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching top POIs: {ex.Message}");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Error fetching top POIs"
                });
            }
        }
    }
}
