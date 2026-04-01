using Microsoft.AspNetCore.Mvc;
using VinhKhanhFoodTour.Api.Models;
using VinhKhanhFoodTour.Api.Services;

namespace VinhKhanhFoodTour.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly AnalyticsService _analyticsService;

        public AnalyticsController(AnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        /// <summary>Ghi nhận sự kiện analytics</summary>
        [HttpPost("event")]
        public async Task<ActionResult<AnalyticsEvent>> TrackEvent([FromBody] AnalyticsEvent ev)
        {
            var result = await _analyticsService.TrackEventAsync(ev);
            return Ok(result);
        }

        /// <summary>Lấy thống kê POI được nghe nhiều nhất</summary>
        [HttpGet("top-pois")]
        public async Task<ActionResult<List<PoiStats>>> GetTopPois([FromQuery] int limit = 10)
        {
            var stats = await _analyticsService.GetTopPoiStatsAsync(limit);
            return Ok(stats);
        }

        /// <summary>Lấy dữ liệu heatmap</summary>
        [HttpGet("heatmap")]
        public async Task<ActionResult<List<HeatmapPoint>>> GetHeatmap()
        {
            var data = await _analyticsService.GetHeatmapDataAsync();
            return Ok(data);
        }

        /// <summary>Lấy tổng quan thống kê</summary>
        [HttpGet("stats")]
        public async Task<ActionResult> GetStats()
        {
            var eventCounts = await _analyticsService.GetEventCountsAsync();
            var uniqueSessions = await _analyticsService.GetUniqueSessionsAsync();

            return Ok(new
            {
                eventCounts,
                uniqueSessions,
                generatedAt = DateTime.UtcNow
            });
        }

        /// <summary>Lấy sự kiện gần đây</summary>
        [HttpGet("recent")]
        public async Task<ActionResult<List<AnalyticsEvent>>> GetRecent([FromQuery] int limit = 50)
        {
            var events = await _analyticsService.GetRecentEventsAsync(limit);
            return Ok(events);
        }
    }
}
