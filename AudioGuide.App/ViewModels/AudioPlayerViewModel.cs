// File: AudioGuide.App/ViewModels/AudioPlayerViewModel.cs
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AudioGuide.App.Helpers;
using AudioGuide.App.Models;
using AudioGuide.App.Services;
using System.Collections.ObjectModel;

namespace AudioGuide.App.ViewModels
{
    /// <summary>
    /// ViewModel quản lý trình phát audio và hàng đợi
    /// Xử lý Play/Pause/Skip, hiển thị progress, duration
    /// </summary>
    public partial class AudioPlayerViewModel : ObservableObject
    {
        private readonly IAudioQueueService _audioQueueService;
        private readonly IAppLanguageService _languageService;
        private CancellationTokenSource? _playbackCts;

        // ========== Observable Properties ==========
        [ObservableProperty]
        private AudioContent? currentAudio;

        [ObservableProperty]
        private ObservableCollection<AudioContent> audioQueue = new();

        [ObservableProperty]
        private bool isPlaying = false;

        [ObservableProperty]
        private bool hasCurrent = false;

        [ObservableProperty]
        private int queueCount = 0;

        [ObservableProperty]
        private int playbackSeconds = 0;

        [ObservableProperty]
        private int totalSeconds = 0;

        [ObservableProperty]
        private double playbackProgress = 0; // 0.0 - 1.0

        [ObservableProperty]
        private string playbackTimeDisplay = "0:00 / 0:00";

        [ObservableProperty]
        private string currentPoiName = "Không có thuyết minh";

        [ObservableProperty]
        private string errorMessage = string.Empty;

        [ObservableProperty]
        private bool hasError = false;

        public AudioPlayerViewModel(
            IAudioQueueService audioQueueService,
            IAppLanguageService languageService)
        {
            _audioQueueService = audioQueueService;
            _languageService = languageService;

            Constants.DebugLog("🎵 AudioPlayerViewModel đã được khởi tạo");

            // Subscribe to events
            _audioQueueService.OnQueueChanged += OnAudioQueueChanged;

            // Cập nhật UI danh sách hàng đợi
            RefreshQueueDisplay();
        }

        // ========== Commands ==========

        /// <summary>
        /// Lệnh phát/tạm dừng audio
        /// </summary>
        [RelayCommand]
        public async Task PlayPauseAsync()
        {
            try
            {
                CurrentAudio = _audioQueueService.GetCurrentAudio();
                if (CurrentAudio == null)
                {
                    ErrorMessage = "❌ Hàng đợi audio trống";
                    HasError = true;
                    return;
                }

                if (IsPlaying)
                {
                    // Tạm dừng
                    IsPlaying = false;
                    _playbackCts?.Cancel();
                    Constants.DebugLog("⏸️ Tạm dừng phát audio");
                }
                else
                {
                    // Phát
                    IsPlaying = true;
                    CurrentPoiName = CurrentAudio.PoiName;
                    TotalSeconds = CurrentAudio.DurationInSeconds ?? 0;
                    Constants.DebugLog($"▶️ Phát audio: {CurrentAudio.PoiName}");

                    // Simulate playback
                    await SimulateAudioPlaybackAsync();
                }
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi phát/tạm dừng audio", ex);
                ErrorMessage = $"❌ Lỗi: {ex.Message}";
                HasError = true;
                IsPlaying = false;
            }
        }

        /// <summary>
        /// Lệnh chuyển sang audio tiếp theo
        /// </summary>
        [RelayCommand]
        public void SkipToNext()
        {
            try
            {
                _playbackCts?.Cancel();
                IsPlaying = false;
                PlaybackSeconds = 0;
                PlaybackProgress = 0;

                CurrentAudio = _audioQueueService.GetNextAudio();

                if (CurrentAudio != null)
                {
                    CurrentPoiName = CurrentAudio.PoiName;
                    TotalSeconds = CurrentAudio.DurationInSeconds ?? 0;
                    Constants.DebugLog($"⏭️ Chuyển tới audio tiếp theo: {CurrentAudio.PoiName}");
                }
                else
                {
                    CurrentPoiName = "Hàng đợi trống";
                    HasCurrent = false;
                }

                RefreshQueueDisplay();
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi chuyển audio", ex);
            }
        }

        /// <summary>
        /// Lệnh xóa audio hiện tại
        /// </summary>
        [RelayCommand]
        public void RemoveCurrentAudio()
        {
            try
            {
                if (CurrentAudio == null) return;

                _playbackCts?.Cancel();
                IsPlaying = false;

                _audioQueueService.RemoveCurrentAudio();

                CurrentAudio = _audioQueueService.GetCurrentAudio();
                if (CurrentAudio != null)
                {
                    CurrentPoiName = CurrentAudio.PoiName;
                    TotalSeconds = CurrentAudio.DurationInSeconds ?? 0;
                }
                else
                {
                    CurrentPoiName = "Hàng đợi trống";
                    HasCurrent = false;
                }

                Constants.DebugLog("🗑️ Xóa audio hiện tại");
                RefreshQueueDisplay();
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi xóa audio", ex);
            }
        }

        /// <summary>
        /// Lệnh xóa tất cả audio khỏi hàng đợi
        /// </summary>
        [RelayCommand]
        public void ClearQueue()
        {
            try
            {
                _playbackCts?.Cancel();
                IsPlaying = false;

                _audioQueueService.ClearQueue();

                CurrentAudio = null;
                CurrentPoiName = "Hàng đợi trống";
                HasCurrent = false;
                PlaybackSeconds = 0;
                PlaybackProgress = 0;

                Constants.DebugLog("🗑️ Xóa tất cả audio khỏi hàng đợi");
                RefreshQueueDisplay();
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi xóa hàng đợi", ex);
            }
        }

        /// <summary>
        /// Lệnh cập nhật tiến độ playback
        /// </summary>
        [RelayCommand]
        public void UpdatePlaybackProgress(double newProgress)
        {
            try
            {
                PlaybackProgress = Math.Max(0, Math.Min(1, newProgress));
                PlaybackSeconds = (int)(PlaybackProgress * TotalSeconds);
                UpdateTimeDisplay();
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi cập nhật tiến độ", ex);
            }
        }

        // ========== Private Methods ==========

        /// <summary>
        /// Simulate playback audio (trong thực tế sẽ dùng MediaElement hoặc AudioPlayer)
        /// </summary>
        private async Task SimulateAudioPlaybackAsync()
        {
            _playbackCts = new CancellationTokenSource();
            try
            {
                while (IsPlaying && PlaybackSeconds < TotalSeconds && !_playbackCts.Token.IsCancellationRequested)
                {
                    await Task.Delay(1000, _playbackCts.Token); // 1 giây
                    PlaybackSeconds++;
                    PlaybackProgress = TotalSeconds > 0 ? (double)PlaybackSeconds / TotalSeconds : 0;
                    UpdateTimeDisplay();
                }

                if (PlaybackSeconds >= TotalSeconds)
                {
                    // Audio phát xong, chuyển sang tiếp theo
                    SkipToNext();
                    if (CurrentAudio != null)
                    {
                        // Tự động phát audio tiếp theo
                        PlayPauseAsync().FireAndForget();
                    }
                }
            }
            catch (OperationCanceledException)
            {
                Constants.DebugLog("⏹️ Playback bị hủy");
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi simulate playback", ex);
            }
        }

        /// <summary>
        /// Cập nhật hiển thị thời gian
        /// </summary>
        private void UpdateTimeDisplay()
        {
            var current = TimeSpan.FromSeconds(PlaybackSeconds);
            var total = TimeSpan.FromSeconds(TotalSeconds);
            PlaybackTimeDisplay = $"{current.Minutes}:{current.Seconds:D2} / {total.Minutes}:{total.Seconds:D2}";
        }

        /// <summary>
        /// Refresh hiển thị hàng đợi
        /// </summary>
        private void RefreshQueueDisplay()
        {
            try
            {
                AudioQueue.Clear();
                var queue = _audioQueueService.GetQueue();
                foreach (var audio in queue)
                {
                    AudioQueue.Add(audio);
                }

                QueueCount = _audioQueueService.GetQueueCount();
                CurrentAudio = _audioQueueService.GetCurrentAudio();

                if (CurrentAudio != null)
                {
                    CurrentPoiName = CurrentAudio.PoiName;
                    TotalSeconds = CurrentAudio.DurationInSeconds ?? 0;
                    HasCurrent = true;
                }
                else
                {
                    CurrentPoiName = "Hàng đợi trống";
                    HasCurrent = false;
                }

                HasError = false;
                ErrorMessage = string.Empty;

                Constants.DebugLog($"🎵 Refresh hàng đợi: {QueueCount} audio");
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi refresh hàng đợi", ex);
            }
        }

        /// <summary>
        /// Xử lý event khi hàng đợi thay đổi
        /// </summary>
        private void OnAudioQueueChanged(object? sender, AudioQueueChangedEventArgs args)
        {
            MainThread.BeginInvokeOnMainThread(() =>
            {
                RefreshQueueDisplay();
            });
        }
    }
}
