using Microsoft.AspNetCore.Mvc;
using VinhKhanhFoodTour.Api.Models;
using VinhKhanhFoodTour.Api.Services;

namespace VinhKhanhFoodTour.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PoiController : ControllerBase
    {
        private readonly PoiService _poiService;

        public PoiController(PoiService poiService)
        {
            _poiService = poiService;
        }

        /// <summary>Lấy tất cả POI đang hoạt động (cho user app)</summary>
        [HttpGet]
        public async Task<ActionResult<List<Poi>>> GetAll()
        {
            var pois = await _poiService.GetActiveAsync();
            return Ok(pois);
        }

        /// <summary>Lấy tất cả POI kể cả inactive (cho admin)</summary>
        [HttpGet("all")]
        public async Task<ActionResult<List<Poi>>> GetAllAdmin()
        {
            if (!AdminTokenHelper.IsAuthorized(Request)) return Unauthorized();
            var pois = await _poiService.GetAllAsync();
            return Ok(pois);
        }

        /// <summary>Lấy POI theo ID</summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Poi>> GetById(string id)
        {
            var poi = await _poiService.GetByIdAsync(id);
            if (poi == null) return NotFound();
            return Ok(poi);
        }

        /// <summary>Tìm POI theo QR Code</summary>
        [HttpGet("qr/{qrCode}")]
        public async Task<ActionResult<Poi>> GetByQrCode(string qrCode)
        {
            var poi = await _poiService.GetByQrCodeAsync(qrCode);
            if (poi == null) return NotFound(new { message = "Không tìm thấy điểm thuyết minh cho QR Code này" });
            return Ok(poi);
        }

        /// <summary>Tạo POI mới</summary>
        [HttpPost]
        public async Task<ActionResult<Poi>> Create([FromBody] Poi poi)
        {
            if (!AdminTokenHelper.IsAuthorized(Request)) return Unauthorized();
            var created = await _poiService.CreateAsync(poi);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        /// <summary>Cập nhật POI</summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Poi poi)
        {
            if (!AdminTokenHelper.IsAuthorized(Request)) return Unauthorized();
            poi.Id = id;
            var result = await _poiService.UpdateAsync(id, poi);
            if (!result) return NotFound();
            return NoContent();
        }

        /// <summary>Xóa POI</summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            if (!AdminTokenHelper.IsAuthorized(Request)) return Unauthorized();
            var result = await _poiService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
