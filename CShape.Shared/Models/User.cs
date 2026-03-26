using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CShape.Shared.Models;

/// <summary>
/// Admin User model for CMS access
/// </summary>
public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;

    public string Role { get; set; } = "viewer"; // admin, editor, viewer
    public bool IsActive { get; set; } = true;

    public string? PhoneNumber { get; set; }
    public string? Department { get; set; }

    public DateTime LastLoginAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
