using System.Collections.Concurrent;

namespace VinhKhanhFoodTour.Api.Services
{
    public sealed class UserPresenceService
    {
        private static readonly TimeSpan OnlineWindow = TimeSpan.FromSeconds(45);
        private static readonly TimeSpan RetentionWindow = TimeSpan.FromMinutes(30);
        private readonly ConcurrentDictionary<string, PresenceSession> _sessions = new();

        public PresenceSession Upsert(PresenceHeartbeatRequest request, string? ipAddress, string? userAgent)
        {
            var now = DateTime.UtcNow;
            var sessionId = NormalizeSessionId(request.SessionId);

            Cleanup(now);

            return _sessions.AddOrUpdate(sessionId,
                _ => new PresenceSession
                {
                    SessionId = sessionId,
                    DisplayName = NormalizeDisplayName(request.DisplayName),
                    Language = request.Language,
                    CurrentPath = request.CurrentPath,
                    IpAddress = ipAddress,
                    UserAgent = userAgent,
                    ConnectedAt = now,
                    LastSeenAt = now,
                    IsKicked = false
                },
                (_, existing) =>
                {
                    existing.DisplayName = NormalizeDisplayName(request.DisplayName);
                    existing.Language = request.Language;
                    existing.CurrentPath = request.CurrentPath;
                    existing.IpAddress = ipAddress ?? existing.IpAddress;
                    existing.UserAgent = userAgent ?? existing.UserAgent;
                    existing.LastSeenAt = now;
                    return existing;
                });
        }

        public IReadOnlyList<PresenceSession> GetOnlineSessions()
        {
            var now = DateTime.UtcNow;
            Cleanup(now);
            return _sessions.Values
                .Where(s => !s.IsKicked && now - s.LastSeenAt <= OnlineWindow)
                .OrderByDescending(s => s.LastSeenAt)
                .ToList();
        }

        public PresenceSession? Get(string sessionId)
        {
            return _sessions.TryGetValue(sessionId, out var session) ? session : null;
        }

        public bool Kick(string sessionId)
        {
            if (!_sessions.TryGetValue(sessionId, out var session)) return false;
            session.IsKicked = true;
            session.KickedAt = DateTime.UtcNow;
            return true;
        }

        private void Cleanup(DateTime now)
        {
            foreach (var item in _sessions)
            {
                if (now - item.Value.LastSeenAt > RetentionWindow)
                {
                    _sessions.TryRemove(item.Key, out _);
                }
            }
        }

        private static string NormalizeDisplayName(string? displayName)
        {
            return string.IsNullOrWhiteSpace(displayName) ? "guest" : displayName.Trim();
        }

        private static string NormalizeSessionId(string? sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId)) return Guid.NewGuid().ToString("N");
            var safe = new string(sessionId.Trim()
                .Where(c => char.IsLetterOrDigit(c) || c == '-' || c == '_' || c == '.')
                .ToArray());
            return string.IsNullOrWhiteSpace(safe) ? Guid.NewGuid().ToString("N") : safe;
        }
    }

    public sealed class PresenceHeartbeatRequest
    {
        public string? SessionId { get; set; }
        public string? DisplayName { get; set; }
        public string? Language { get; set; }
        public string? CurrentPath { get; set; }
    }

    public sealed class PresenceSession
    {
        public string SessionId { get; set; } = "";
        public string DisplayName { get; set; } = "guest";
        public string? Language { get; set; }
        public string? CurrentPath { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public DateTime ConnectedAt { get; set; }
        public DateTime LastSeenAt { get; set; }
        public bool IsKicked { get; set; }
        public DateTime? KickedAt { get; set; }
    }
}
