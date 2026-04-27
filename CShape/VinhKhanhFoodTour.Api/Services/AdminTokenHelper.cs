using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace VinhKhanhFoodTour.Api.Services
{
    public static class AdminTokenHelper
    {
        private const string DefaultDemoSecret = "vinhkhanh-demo-secret-change-me";

        public static string CreateToken(string username, string role, TimeSpan? lifetime = null)
        {
            var expiresAt = DateTimeOffset.UtcNow.Add(lifetime ?? TimeSpan.FromHours(8)).ToUnixTimeSeconds();
            var payload = $"{username}|{role}|{expiresAt}";
            var payload64 = Base64UrlEncode(Encoding.UTF8.GetBytes(payload));
            var signature = Sign(payload64);
            return $"{payload64}.{signature}";
        }

        public static bool IsAuthorized(HttpRequest request, params string[] allowedRoles)
        {
            var header = request.Headers.Authorization.ToString();
            if (string.IsNullOrWhiteSpace(header) || !header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            return ValidateToken(header["Bearer ".Length..].Trim(), allowedRoles.Length == 0 ? ["admin", "editor"] : allowedRoles);
        }

        private static bool ValidateToken(string token, string[] allowedRoles)
        {
            try
            {
                var parts = token.Split('.');
                if (parts.Length != 2) return false;

                var expectedSignature = Sign(parts[0]);
                if (!CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(expectedSignature),
                    Encoding.UTF8.GetBytes(parts[1])))
                {
                    return false;
                }

                var payload = Encoding.UTF8.GetString(Base64UrlDecode(parts[0]));
                var fields = payload.Split('|');
                if (fields.Length != 3) return false;

                var role = fields[1];
                if (!allowedRoles.Contains(role, StringComparer.OrdinalIgnoreCase)) return false;

                if (!long.TryParse(fields[2], out var exp)) return false;
                return DateTimeOffset.UtcNow.ToUnixTimeSeconds() <= exp;
            }
            catch
            {
                return false;
            }
        }

        private static string Sign(string payload64)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(GetSecret()));
            return Base64UrlEncode(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload64)));
        }

        private static string GetSecret() =>
            Environment.GetEnvironmentVariable("AUTH_TOKEN_SECRET")
            ?? Environment.GetEnvironmentVariable("Auth__TokenSecret")
            ?? DefaultDemoSecret;

        private static string Base64UrlEncode(byte[] bytes) =>
            Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');

        private static byte[] Base64UrlDecode(string value)
        {
            var base64 = value.Replace('-', '+').Replace('_', '/');
            base64 = base64.PadRight(base64.Length + (4 - base64.Length % 4) % 4, '=');
            return Convert.FromBase64String(base64);
        }
    }
}
