using Microsoft.AspNetCore.Mvc;
using VinhKhanhFoodTour.Api.Models;
using VinhKhanhFoodTour.Api.Services;

namespace VinhKhanhFoodTour.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TourController : ControllerBase
    {
        private readonly TourService _tourService;

        public TourController(TourService tourService)
        {
            _tourService = tourService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Tour>>> GetAll()
        {
            var tours = await _tourService.GetAllAsync();
            return Ok(tours);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Tour>> GetById(string id)
        {
            var tour = await _tourService.GetByIdAsync(id);
            if (tour == null) return NotFound();
            return Ok(tour);
        }

        [HttpPost]
        public async Task<ActionResult<Tour>> Create([FromBody] Tour tour)
        {
            var created = await _tourService.CreateAsync(tour);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Tour tour)
        {
            tour.Id = id;
            var result = await _tourService.UpdateAsync(id, tour);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var result = await _tourService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
