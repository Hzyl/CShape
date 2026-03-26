using System.Text.Json;
using CShape.Shared.Models;

namespace CShape.Maui.Services;

public interface IApiClient
{
    Task<List<Tour>> GetToursAsync();
    Task<Tour?> GetTourByIdAsync(string id);
    Task<List<POI>> GetPOIsByTourAsync(List<string> poiIds);
}

public class ApiClient : IApiClient
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;

    public ApiClient()
    {
        _httpClient = new HttpClient();
        _baseUrl = "http://localhost:5000/api"; // Will be configurable
    }

    public async Task<List<Tour>> GetToursAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync($"{_baseUrl}/tour");
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            var tours = JsonSerializer.Deserialize<List<Tour>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return tours ?? new();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error fetching tours: {ex.Message}");
            return new();
        }
    }

    public async Task<Tour?> GetTourByIdAsync(string id)
    {
        try
        {
            var response = await _httpClient.GetAsync($"{_baseUrl}/tour/{id}");
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            var tour = JsonSerializer.Deserialize<Tour>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return tour;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error fetching tour {id}: {ex.Message}");
            return null;
        }
    }

    public async Task<List<POI>> GetPOIsByTourAsync(List<string> poiIds)
    {
        var pois = new List<POI>();
        foreach (var id in poiIds)
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_baseUrl}/poi/{id}");
                response.EnsureSuccessStatusCode();
                var json = await response.Content.ReadAsStringAsync();
                var poi = JsonSerializer.Deserialize<POI>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (poi != null)
                    pois.Add(poi);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error fetching POI {id}: {ex.Message}");
            }
        }
        return pois;
    }
}
