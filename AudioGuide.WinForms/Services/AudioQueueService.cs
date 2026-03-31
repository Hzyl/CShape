using AudioGuide.WinForms.Helpers;
using AudioGuide.WinForms.Models;
using System.Text.Json;

namespace AudioGuide.WinForms.Services
{
    /// <summary>
    /// Thực thi IAudioQueueService - Quản lý hàng đợi audio
    /// Quy tắc Cooldown: Chống spam - KHÔNG phát cùng POI trong vòng 5 phút
    /// </summary>
    public class AudioQueueService : IAudioQueueService
    {
        /// <summary>
        /// Hàng đợi audio (Queue - FIFO)
        /// </summary>
        private Queue<AudioContent> _audioQueue = new();

        /// <summary>
        /// Lịch sử phát audio - Lưu lần cuối cùng mỗi POI được phát
        /// Key: PoiId, Value: Thời gian phát cuối cùng
        /// </summary>
        private Dictionary<Guid, DateTime> _audioPlaybackHistory = new();

        /// <summary>
        /// Lock object cho thread-safety
        /// </summary>
        private readonly object _lockObject = new();

        public event EventHandler<AudioQueueChangedEventArgs>? OnQueueChanged;

        public AudioQueueService()
        {
            Constants.DebugLog("🎵 AudioQueueService đã được khởi tạo");
            LoadAudioHistoryFromPreferences();
        }

        /// <summary>
        /// Thêm audio vào hàng đợi với kiểm tra cooldown
        /// </summary>
        public bool TryEnqueueAudio(AudioContent audioContent)
        {
            lock (_lockObject)
            {
                try
                {
                    // Kiểm tra xem POI này có đang trong cooldown không
                    if (!CanEnqueuePoi(audioContent.PoiId))
                    {
                        var remaining = GetCooldownRemaining(audioContent.PoiId);
                        Constants.DebugLog(
                            $"⏳ POI '{audioContent.PoiName}' đang trong cooldown. Còn lại: {remaining.TotalSeconds:F0} giây");
                        return false;
                    }

                    // Kiểm tra hàng đợi không vượt quá max size
                    if (_audioQueue.Count >= Constants.MaxAudioQueueSize)
                    {
                        Constants.DebugLog($"⚠️ Hàng đợi audio đầy (tối đa {Constants.MaxAudioQueueSize})");
                        return false;
                    }

                    // Thêm vào hàng đợi
                    _audioQueue.Enqueue(audioContent);
                    Constants.DebugLog($"✅ Đã thêm '{audioContent.PoiName}' vào hàng đợi (tổng: {_audioQueue.Count})");

                    // Lưu thời gian phát
                    _audioPlaybackHistory[audioContent.PoiId] = DateTime.Now;

                    // Bắn event
                    RaiseQueueChanged();

                    return true;
                }
                catch (Exception ex)
                {
                    Constants.ErrorLog("❌ Lỗi khi thêm audio vào hàng đợi", ex);
                    return false;
                }
            }
        }

        /// <summary>
        /// Lấy audio hiện tại (front of queue)
        /// </summary>
        public AudioContent? GetCurrentAudio()
        {
            lock (_lockObject)
            {
                return _audioQueue.Count > 0 ? _audioQueue.Peek() : null;
            }
        }

        /// <summary>
        /// Lấy audio tiếp theo (xóa audio hiện tại)
        /// </summary>
        public AudioContent? GetNextAudio()
        {
            lock (_lockObject)
            {
                if (_audioQueue.Count > 0)
                {
                    _audioQueue.Dequeue();
                    Constants.DebugLog($"⏭️ Chuyển tới audio tiếp theo (còn lại: {_audioQueue.Count})");
                    RaiseQueueChanged();
                }

                return _audioQueue.Count > 0 ? _audioQueue.Peek() : null;
            }
        }

        /// <summary>
        /// Xóa audio hiện tại
        /// </summary>
        public void RemoveCurrentAudio()
        {
            lock (_lockObject)
            {
                if (_audioQueue.Count > 0)
                {
                    _audioQueue.Dequeue();
                    Constants.DebugLog($"🗑️ Đã xóa audio hiện tại (còn lại: {_audioQueue.Count})");
                    RaiseQueueChanged();
                }
            }
        }

        /// <summary>
        /// Xóa tất cả audio
        /// </summary>
        public void ClearQueue()
        {
            lock (_lockObject)
            {
                _audioQueue.Clear();
                Constants.DebugLog("🗑️ Đã xóa tất cả audio khỏi hàng đợi");
                RaiseQueueChanged();
            }
        }

        /// <summary>
        /// Lấy số lượng audio trong hàng đợi
        /// </summary>
        public int GetQueueCount()
        {
            lock (_lockObject)
            {
                return _audioQueue.Count;
            }
        }

        /// <summary>
        /// Kiểm tra xem POI có thể được thêm vào hàng đợi không
        /// (Kiểm tra cooldown 5 phút)
        /// </summary>
        public bool CanEnqueuePoi(Guid poiId)
        {
            lock (_lockObject)
            {
                // Nếu POI chưa bao giờ được phát, cho phép thêm
                if (!_audioPlaybackHistory.ContainsKey(poiId))
                {
                    return true;
                }

                // Lấy thời gian phát cuối cùng
                var lastPlayedTime = _audioPlaybackHistory[poiId];
                var timeSinceLastPlay = DateTime.Now - lastPlayedTime;

                // Kiểm tra xem có vượt quá cooldown chưa
                var cooldownDuration = TimeSpan.FromMinutes(Constants.AudioQueueCooldownMinutes);
                return timeSinceLastPlay >= cooldownDuration;
            }
        }

        /// <summary>
        /// Lấy thời gian còn lại của cooldown
        /// </summary>
        public TimeSpan GetCooldownRemaining(Guid poiId)
        {
            lock (_lockObject)
            {
                if (!_audioPlaybackHistory.ContainsKey(poiId))
                {
                    return TimeSpan.Zero;
                }

                var lastPlayedTime = _audioPlaybackHistory[poiId];
                var timeSinceLastPlay = DateTime.Now - lastPlayedTime;
                var cooldownDuration = TimeSpan.FromMinutes(Constants.AudioQueueCooldownMinutes);

                var remaining = cooldownDuration - timeSinceLastPlay;
                return remaining > TimeSpan.Zero ? remaining : TimeSpan.Zero;
            }
        }

        /// <summary>
        /// Lấy toàn bộ hàng đợi
        /// </summary>
        public List<AudioContent> GetQueue()
        {
            lock (_lockObject)
            {
                return _audioQueue.ToList();
            }
        }

        /// <summary>
        /// Bắn event khi hàng đợi thay đổi
        /// </summary>
        private void RaiseQueueChanged()
        {
            OnQueueChanged?.Invoke(this, new AudioQueueChangedEventArgs
            {
                CurrentAudio = GetCurrentAudio(),
                QueueCount = GetQueueCount()
            });

            // Lưu lịch sử vào Preferences
            SaveAudioHistoryToPreferences();
        }

        /// <summary>
        /// Lưu lịch sử phát audio vào Preferences (persistent storage)
        /// </summary>
        private void SaveAudioHistoryToPreferences()
        {
            try
            {
                // Chuyển dictionary thành JSON
                var json = JsonSerializer.Serialize(_audioPlaybackHistory);
                PreferencesHelper.Set(Constants.PreferenceKeyAudioHistory, json);
                Constants.DebugLog("💾 Đã lưu lịch sử audio");
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi lưu lịch sử audio", ex);
            }
        }

        /// <summary>
        /// Tải lịch sử phát audio từ Preferences
        /// </summary>
        private void LoadAudioHistoryFromPreferences()
        {
            try
            {
                var json = PreferencesHelper.Get(Constants.PreferenceKeyAudioHistory, "{}");
                _audioPlaybackHistory = JsonSerializer.Deserialize<Dictionary<Guid, DateTime>>(json)
                    ?? new Dictionary<Guid, DateTime>();

                Constants.DebugLog($"📖 Đã tải lịch sử audio ({_audioPlaybackHistory.Count} POIs)");

                // Xóa các entry cũ hơn 24 giờ để tiết kiệm storage
                CleanOldHistoryEntries();
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi tải lịch sử audio", ex);
                _audioPlaybackHistory = new Dictionary<Guid, DateTime>();
            }
        }

        /// <summary>
        /// Xóa các entry trong lịch sử cũ hơn 24 giờ
        /// </summary>
        private void CleanOldHistoryEntries()
        {
            var oldEntries = _audioPlaybackHistory
                .Where(x => DateTime.Now - x.Value > TimeSpan.FromHours(24))
                .Select(x => x.Key)
                .ToList();

            foreach (var key in oldEntries)
            {
                _audioPlaybackHistory.Remove(key);
            }

            if (oldEntries.Count > 0)
            {
                Constants.DebugLog($"🗑️ Đã xóa {oldEntries.Count} entry cũ từ lịch sử audio");
                SaveAudioHistoryToPreferences();
            }
        }
    }
}
