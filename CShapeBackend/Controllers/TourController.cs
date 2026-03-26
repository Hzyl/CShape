using Microsoft.AspNetCore.Mvc;
using CShapeBackend.Services;
using CShape.Shared.Models;

namespace CShapeBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TourController : ControllerBase
{
    private readonly ITourService _tourService;

    public TourController(ITourService tourService)
    {
        _tourService = tourService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Tour>>> GetAllTours()
    {
        try
        {
            var tours = await _tourService.GetAllToursAsync();
            return Ok(tours);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Tour>> GetTourById(string id)
    {
        try
        {
            var tour = await _tourService.GetTourByIdAsync(id);
            if (tour == null)
                return NotFound();
            return Ok(tour);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
    }

    [HttpPost]
    public async Task<ActionResult<string>> CreateTour(Tour tour)
    {
        try
        {
            var id = await _tourService.CreateTourAsync(tour);
            return CreatedAtAction(nameof(GetTourById), new { id }, id);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateTour(string id, Tour tour)
    {
        try
        {
            tour.Id = id;
            var success = await _tourService.UpdateTourAsync(id, tour);
            if (!success)
                return NotFound();
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTour(string id)
    {
        try
        {
            var success = await _tourService.DeleteTourAsync(id);
            if (!success)
                return NotFound();
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
    }
}
