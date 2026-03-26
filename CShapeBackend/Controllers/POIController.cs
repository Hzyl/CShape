using Microsoft.AspNetCore.Mvc;
using CShapeBackend.Services;
using CShape.Shared.Models;

namespace CShapeBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class POIController : ControllerBase
{
    private readonly IPOIService _poiService;

    public POIController(IPOIService poiService)
    {
        _poiService = poiService;
    }

    [HttpGet]
    public async Task<ActionResult<List<POI>>> GetAllPOIs()
    {
        try
        {
            var pois = await _poiService.GetAllPOIsAsync();
            return Ok(pois);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<POI>> GetPOIById(string id)
    {
        try
        {
            var poi = await _poiService.GetPOIByIdAsync(id);
            if (poi == null)
                return NotFound();
            return Ok(poi);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
    }

    [HttpGet("type/{type}")]
    public async Task<ActionResult<List<POI>>> GetPOIsByType(string type)
    {
        try
        {
            var pois = await _poiService.GetPOIsByTypeAsync(type);
            return Ok(pois);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
    }

    [HttpPost]
    public async Task<ActionResult<string>> CreatePOI(POI poi)
    {
        try
        {
            var id = await _poiService.CreatePOIAsync(poi);
            return CreatedAtAction(nameof(GetPOIById), new { id }, id);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdatePOI(string id, POI poi)
    {
        try
        {
            poi.Id = id;
            var success = await _poiService.UpdatePOIAsync(id, poi);
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
    public async Task<ActionResult> DeletePOI(string id)
    {
        try
        {
            var success = await _poiService.DeletePOIAsync(id);
            if (!success)
                return NotFound();
            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
    }

    [HttpGet("nearby")]
    public async Task<ActionResult<List<POI>>> GetNearbyPOIs([FromQuery] double latitude, [FromQuery] double longitude, [FromQuery] double radiusKm = 1)
    {
        try
        {
            var pois = await _poiService.GetNearbyPOIsAsync(latitude, longitude, radiusKm);
            return Ok(pois);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error: {ex.Message}");
        }
    }
}
