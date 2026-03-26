using MongoDB.Driver;
using CShape.Shared.Models;

namespace CShapeBackend.Services;

public class MongoDbService
{
    private readonly IMongoClient _client;
    private readonly IMongoDatabase _database;

    public MongoDbService(IConfiguration configuration)
    {
        var mongoUri = configuration.GetSection("MongoDb:ConnectionString").Value
            ?? throw new ArgumentNullException(nameof(configuration), "MongoDB connection string not found");

        _client = new MongoClient(mongoUri);
        _database = _client.GetDatabase(configuration.GetSection("MongoDb:DatabaseName").Value ?? "CShape");
    }

    // POI Collections
    public IMongoCollection<POI> GetPOICollection()
        => _database.GetCollection<POI>("pois");

    // Tour Collections
    public IMongoCollection<Tour> GetTourCollection()
        => _database.GetCollection<Tour>("tours");

    // User Collections
    public IMongoCollection<User> GetUserCollection()
        => _database.GetCollection<User>("users");

    // Analytics Event Collections
    public IMongoCollection<AnalyticsEvent> GetAnalyticsEventCollection()
        => _database.GetCollection<AnalyticsEvent>("analytics_events");

    // Generic method for any collection
    public IMongoCollection<T> GetCollection<T>(string collectionName)
        => _database.GetCollection<T>(collectionName);
}
