using System.Net.Http.Json;
using CShape.Shared.Models;
using System.Text.Json;

namespace CShape.Blazor.Services;

public interface IAdminService
{
    Task<List<POI>> GetAllPOIsAsync();
    Task<POI?> GetPOIByIdAsync(string id);
    Task<string> CreatePOIAsync(POI poi);
    Task<bool> UpdatePOIAsync(string id, POI poi);
    Task<bool> DeletePOIAsync(string id);

    Task<List<Tour>> GetAllToursAsync();
    Task<Tour?> GetTourByIdAsync(string id);
    Task<string> CreateTourAsync(Tour tour);
    Task<bool> UpdateTourAsync(string id, Tour tour);
    Task<bool> DeleteTourAsync(string id);
}

public class AdminService : IAdminService
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;

    public AdminService(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _baseUrl = "http://localhost:5000/api"; // Will be configurable via appsettings
    }

    // POI Methods
    public async Task<List<POI>> GetAllPOIsAsync()
    {
        try
        {
            var response = await _httpClient.GetFromJsonAsync<List<POI>>($"{_baseUrl}/poi");
            return response ?? new();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error fetching POIs: {ex.Message}");
            return new();
        }
    }

    public async Task<POI?> GetPOIByIdAsync(string id)
    {
        try
        {
            return await _httpClient.GetFromJsonAsync<POI>($"{_baseUrl}/poi/{id}");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error fetching POI {id}: {ex.Message}");
            return null;
        }
    }

    public async Task<string> CreatePOIAsync(POI poi)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync($"{_baseUrl}/poi", poi);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return json?.ToString() ?? poi.Id ?? string.Empty;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error creating POI: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> UpdatePOIAsync(string id, POI poi)
    {
        try
        {
            var response = await _httpClient.PutAsJsonAsync($"{_baseUrl}/poi/{id}", poi);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error updating POI {id}: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> DeletePOIAsync(string id)
    {
        try
        {
            var response = await _httpClient.DeleteAsync($"{_baseUrl}/poi/{id}");
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error deleting POI {id}: {ex.Message}");
            return false;
        }
    }

    // Tour Methods
    public async Task<List<Tour>> GetAllToursAsync()
    {
        try
        {
            var response = await _httpClient.GetFromJsonAsync<List<Tour>>($"{_baseUrl}/tour");
            return response ?? new();
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
            return await _httpClient.GetFromJsonAsync<Tour>($"{_baseUrl}/tour/{id}");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error fetching tour {id}: {ex.Message}");
            return null;
        }
    }

    public async Task<string> CreateTourAsync(Tour tour)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync($"{_baseUrl}/tour", tour);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return json?.ToString() ?? tour.Id ?? string.Empty;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error creating tour: {ex.Message}");
            throw;
        }
    }

    public async Task<bool> UpdateTourAsync(string id, Tour tour)
    {
        try
        {
            var response = await _httpClient.PutAsJsonAsync($"{_baseUrl}/tour/{id}", tour);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error updating tour {id}: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> DeleteTourAsync(string id)
    {
        try
        {
            var response = await _httpClient.DeleteAsync($"{_baseUrl}/tour/{id}");
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error deleting tour {id}: {ex.Message}");
            return false;
        }
    }
}
