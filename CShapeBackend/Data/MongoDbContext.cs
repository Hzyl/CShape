using MongoDB.Driver;
using CShapeBackend.Models;

namespace CShapeBackend.Data
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        public MongoDbContext(IConfiguration configuration)
        {
            var mongoSettings = configuration.GetSection("MongoDb");
            var connectionString = mongoSettings.GetValue<string>("ConnectionString");
            var databaseName = mongoSettings.GetValue<string>("DatabaseName");

            var client = new MongoClient(connectionString);
            _database = client.GetDatabase(databaseName);

            // Initialize collections
            InitializeCollections();
        }

        public IMongoCollection<POI> POIs => _database.GetCollection<POI>("pois");
        public IMongoCollection<Tour> Tours => _database.GetCollection<Tour>("tours");
        public IMongoCollection<AdminUser> AdminUsers => _database.GetCollection<AdminUser>("admin_users");
        public IMongoCollection<AnalyticsLog> AnalyticsLogs => _database.GetCollection<AnalyticsLog>("analytics_logs");

        private void InitializeCollections()
        {
            // Create indexes for better query performance
            try
            {
                // POI indexes
                var poiIndexModel = new CreateIndexModel<POI>(
                    Builders<POI>.IndexKeys
                        .Ascending(x => x.Name)
                        .Ascending(x => x.Type)
                );
                POIs.Indexes.CreateOne(poiIndexModel);

                // AdminUser indexes
                var adminIndexModel = new CreateIndexModel<AdminUser>(
                    Builders<AdminUser>.IndexKeys.Ascending(x => x.Email),
                    new CreateIndexOptions { Unique = true }
                );
                AdminUsers.Indexes.CreateOne(adminIndexModel);

                // Analytics indexes
                var analyticsIndexModel = new CreateIndexModel<AnalyticsLog>(
                    Builders<AnalyticsLog>.IndexKeys
                        .Ascending(x => x.SessionId)
                        .Ascending(x => x.Timestamp)
                );
                AnalyticsLogs.Indexes.CreateOne(analyticsIndexModel);
            }
            catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
            {
                // Index already exists
            }
        }
    }

    // Attribute for collection name
    [AttributeUsage(AttributeTargets.Class)]
    public class BsonCollectionAttribute : Attribute
    {
        public string CollectionName { get; }

        public BsonCollectionAttribute(string collectionName)
        {
            CollectionName = collectionName;
        }
    }
}
