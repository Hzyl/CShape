using MongoDB.Bson;
using MongoDB.Driver;
using CShape.Shared.Models;

namespace CShapeBackend.Services;

public interface IPOIService
{
    Task<List<POI>> GetAllPOIsAsync();
    Task<POI?> GetPOIByIdAsync(string id);
    Task<List<POI>> GetPOIsByTypeAsync(string type);
    Task<string> CreatePOIAsync(POI poi);
    Task<bool> UpdatePOIAsync(string id, POI poi);
    Task<bool> DeletePOIAsync(string id);
    Task<List<POI>> GetNearbyPOIsAsync(double latitude, double longitude, double radiusKm);
}

public class POIService : IPOIService
{
    private readonly IMongoCollection<POI> _poiCollection;

    public POIService(MongoDbService mongoDbService)
    {
        _poiCollection = mongoDbService.GetPOICollection();
    }

    public async Task<List<POI>> GetAllPOIsAsync()
    {
        return await _poiCollection.Find(_ => true).ToListAsync();
    }

    public async Task<POI?> GetPOIByIdAsync(string id)
    {
        if (!ObjectId.TryParse(id, out var objectId))
            return null;

        return await _poiCollection.Find(p => p.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<POI>> GetPOIsByTypeAsync(string type)
    {
        return await _poiCollection.Find(p => p.Type == type).ToListAsync();
    }

    public async Task<string> CreatePOIAsync(POI poi)
    {
        poi.CreatedAt = DateTime.UtcNow;
        poi.UpdatedAt = DateTime.UtcNow;

        await _poiCollection.InsertOneAsync(poi);
        return poi.Id!;
    }

    public async Task<bool> UpdatePOIAsync(string id, POI poi)
    {
        poi.UpdatedAt = DateTime.UtcNow;

        var result = await _poiCollection.ReplaceOneAsync(
            p => p.Id == id,
            poi,
            new ReplaceOptions { IsUpsert = false }
        );

        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeletePOIAsync(string id)
    {
        var result = await _poiCollection.DeleteOneAsync(p => p.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<List<POI>> GetNearbyPOIsAsync(double latitude, double longitude, double radiusKm)
    {
        // Simple distance filter (can be enhanced with geospatial queries)
        const double tolerancePercent = 0.02; // 2% tolerance for nearby check

        var allPOIs = await GetAllPOIsAsync();
        var nearbyPOIs = new List<POI>();

        foreach (var poi in allPOIs)
        {
            var distance = CalculateDistance(latitude, longitude, poi.Latitude, poi.Longitude);
            if (distance <= radiusKm * (1 + tolerancePercent))
            {
                nearbyPOIs.Add(poi);
            }
        }

        return nearbyPOIs;
    }

    private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double earthRadiusKm = 6371;
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return earthRadiusKm * c;
    }

    private static double ToRadians(double degrees)
        => degrees * Math.PI / 180;
}
