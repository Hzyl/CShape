using System.Security.Cryptography;
using System.Text;
using MongoDB.Driver;
using VinhKhanhFoodTour.Api.Models;

namespace VinhKhanhFoodTour.Api.Services
{
    public class AuthService
    {
        public const string DefaultAdminUsername = "admin";
        public const string DefaultAdminPasswordHash = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";

        private readonly IMongoCollection<User> _users;

        public AuthService(IMongoDatabase database)
        {
            _users = database.GetCollection<User>("users");
        }

        /// <summary>Đăng nhập admin</summary>
        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            var passwordHash = ComputePasswordHash(request.Password);
            var user = await _users
                .Find(u => u.Username == request.Username && u.PasswordHash == passwordHash)
                .FirstOrDefaultAsync();

            if (user == null) return null;

            var token = AdminTokenHelper.CreateToken(user.Username, user.Role);

            return new LoginResponse
            {
                Token = token,
                Username = user.Username,
                Role = user.Role
            };
        }

        /// <summary>Hash mật khẩu bằng SHA256</summary>
        public static string ComputePasswordHash(string password)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
            return Convert.ToHexString(bytes).ToLowerInvariant();
        }

        public static bool VerifyPassword(string password, string expectedHash) =>
            string.Equals(ComputePasswordHash(password), expectedHash, StringComparison.OrdinalIgnoreCase);

        /// <summary>Seed tài khoản admin mặc định</summary>
        public async Task SeedDataAsync()
        {
            var count = await _users.CountDocumentsAsync(_ => true);
            if (count > 0) return;

            var admin = new User
            {
                Username = DefaultAdminUsername,
                PasswordHash = DefaultAdminPasswordHash,
                Role = "admin"
            };

            await _users.InsertOneAsync(admin);
        }
    }
}
