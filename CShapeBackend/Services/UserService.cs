using MongoDB.Driver;
using CShape.Shared.Models;

namespace CShapeBackend.Services;

public interface IUserService
{
    Task<List<User>> GetAllUsersAsync();
    Task<User?> GetUserByIdAsync(string id);
    Task<User?> GetUserByEmailAsync(string email);
    Task<string> CreateUserAsync(User user);
    Task<bool> UpdateUserAsync(string id, User user);
    Task<bool> DeleteUserAsync(string id);
}

public class UserService : IUserService
{
    private readonly IMongoCollection<User> _userCollection;

    public UserService(MongoDbService mongoDbService)
    {
        _userCollection = mongoDbService.GetUserCollection();
    }

    public async Task<List<User>> GetAllUsersAsync()
    {
        return await _userCollection.Find(u => u.IsActive).ToListAsync();
    }

    public async Task<User?> GetUserByIdAsync(string id)
    {
        return await _userCollection.Find(u => u.Id == id).FirstOrDefaultAsync();
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _userCollection.Find(u => u.Email == email).FirstOrDefaultAsync();
    }

    public async Task<string> CreateUserAsync(User user)
    {
        user.CreatedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        await _userCollection.InsertOneAsync(user);
        return user.Id!;
    }

    public async Task<bool> UpdateUserAsync(string id, User user)
    {
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userCollection.ReplaceOneAsync(
            u => u.Id == id,
            user,
            new ReplaceOptions { IsUpsert = false }
        );

        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        var result = await _userCollection.DeleteOneAsync(u => u.Id == id);
        return result.DeletedCount > 0;
    }
}
