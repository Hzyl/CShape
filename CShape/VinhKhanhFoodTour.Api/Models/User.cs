using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace VinhKhanhFoodTour.Api.Models
{
    /// <summary>
    /// Người dùng quản trị CMS
    /// </summary>
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("username")]
        public string Username { get; set; } = string.Empty;

        [BsonElement("passwordHash")]
        public string PasswordHash { get; set; } = string.Empty;

        /// <summary>Vai trò: admin, editor</summary>
        [BsonElement("role")]
        public string Role { get; set; } = "editor";

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>DTO cho đăng nhập</summary>
    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    /// <summary>DTO cho response đăng nhập</summary>
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
