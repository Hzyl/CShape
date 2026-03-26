using MongoDB.Driver;
using CShape.Shared.Models;

namespace CShapeBackend.Services;

public interface ITourService
{
    Task<List<Tour>> GetAllToursAsync();
    Task<Tour?> GetTourByIdAsync(string id);
    Task<string> CreateTourAsync(Tour tour);
    Task<bool> UpdateTourAsync(string id, Tour tour);
    Task<bool> DeleteTourAsync(string id);
}

public class TourService : ITourService
{
    private readonly IMongoCollection<Tour> _tourCollection;

    public TourService(MongoDbService mongoDbService)
    {
        _tourCollection = mongoDbService.GetTourCollection();
    }

    public async Task<List<Tour>> GetAllToursAsync()
    {
        return await _tourCollection.Find(t => t.IsActive).ToListAsync();
    }

    public async Task<Tour?> GetTourByIdAsync(string id)
    {
        return await _tourCollection.Find(t => t.Id == id).FirstOrDefaultAsync();
    }

    public async Task<string> CreateTourAsync(Tour tour)
    {
        tour.CreatedAt = DateTime.UtcNow;
        tour.UpdatedAt = DateTime.UtcNow;

        await _tourCollection.InsertOneAsync(tour);
        return tour.Id!;
    }

    public async Task<bool> UpdateTourAsync(string id, Tour tour)
    {
        tour.UpdatedAt = DateTime.UtcNow;

        var result = await _tourCollection.ReplaceOneAsync(
            t => t.Id == id,
            tour,
            new ReplaceOptions { IsUpsert = false }
        );

        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteTourAsync(string id)
    {
        var result = await _tourCollection.DeleteOneAsync(t => t.Id == id);
        return result.DeletedCount > 0;
    }
}
