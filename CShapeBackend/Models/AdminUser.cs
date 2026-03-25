using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CShapeBackend.Models
{
    /// <summary>
    /// Admin Users - Tài khoản quản trị viên
    /// </summary>
    [BsonCollection("admin_users")]
    public class AdminUser
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("password_hash")]
        public string PasswordHash { get; set; } = string.Empty;

        [BsonElement("full_name")]
        public string FullName { get; set; } = string.Empty;

        [BsonElement("role")]
        public string Role { get; set; } = "admin"; // admin, editor, viewer

        [BsonElement("is_active")]
        public bool IsActive { get; set; } = true;

        [BsonElement("last_login_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? LastLoginAt { get; set; }

        [BsonElement("failed_login_attempts")]
        public int FailedLoginAttempts { get; set; } = 0;

        [BsonElement("locked_until")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? LockedUntil { get; set; }

        [BsonElement("created_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updated_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
