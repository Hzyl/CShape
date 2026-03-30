// File: AudioGuide.App/ViewModels/PoiDetailViewModel.cs
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AudioGuide.App.Helpers;
using AudioGuide.App.Models;
using AudioGuide.App.Services;

namespace AudioGuide.App.ViewModels
{
    /// <summary>
    /// ViewModel hiển thị chi tiết một POI với nội dung thuyết minh audio
    /// </summary>
    public partial class PoiDetailViewModel : ObservableObject
    {
        private readonly IApiService _apiService;
        private readonly IAudioQueueService _audioQueueService;
        private readonly IAppLanguageService _languageService;

        // ========== Observable Properties ==========
        [ObservableProperty]
        private PoiDetailDto? poiDetail;

        [ObservableProperty]
        private bool isLoading = false;

        [ObservableProperty]
        private string loadingMessage = "Đang tải thông tin...";

        [ObservableProperty]
        private bool hasError = false;

        [ObservableProperty]
        private string errorMessage = string.Empty;

        [ObservableProperty]
        private bool hasLanguageFallback = false;

        [ObservableProperty]
        private string fallbackMessage = string.Empty;

        [ObservableProperty]
        private bool canPlayAudio = false;

        [ObservableProperty]
        private bool isInCooldown = false;

        [ObservableProperty]
        private string cooldownMessage = string.Empty;

        [ObservableProperty]
        private string currentLanguage = "vi";

        public PoiDetailViewModel(
            IApiService apiService,
            IAudioQueueService audioQueueService,
            IAppLanguageService languageService)
        {
            _apiService = apiService;
            _audioQueueService = audioQueueService;
            _languageService = languageService;

            CurrentLanguage = _languageService.GetCurrentLanguage();

            Constants.DebugLog("📋 PoiDetailViewModel đã được khởi tạo");

            // Subscribe to events
            _languageService.OnLanguageChanged += OnLanguageChanged;
        }

        // ========== Commands ==========

        /// <summary>
        /// Lệnh tải chi tiết POI
        /// </summary>
        [RelayCommand]
        public async Task LoadPoiDetailAsync(Guid poiId)
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "📋 Đang tải thông tin chi tiết...";
                HasError = false;
                ErrorMessage = string.Empty;
                HasLanguageFallback = false;
                FallbackMessage = string.Empty;

                Constants.DebugLog($"📋 Tải chi tiết POI: {poiId}");

                // Gọi API
                var response = await _apiService.GetPoiDetailAsync(poiId, CurrentLanguage);

                if (!response.Success || response.Data == null)
                {
                    throw new Exception(response.Message ?? "Không thể lấy chi tiết POI");
                }

                PoiDetail = response.Data;

                // Kiểm tra fallback ngôn ngữ
                if (!string.IsNullOrWhiteSpace(PoiDetail.LanguageFallbackNote))
                {
                    HasLanguageFallback = true;
                    FallbackMessage = $"⚠️ {PoiDetail.LanguageFallbackNote}";
                    Constants.DebugLog($"⚠️ Fallback ngôn ngữ: {FallbackMessage}");
                }

                // Kiểm tra xem có audio không
                CanPlayAudio = !string.IsNullOrWhiteSpace(PoiDetail.AudioUrl);

                // Kiểm tra cooldown
                CheckCooldownStatus();

                LoadingMessage = $"✅ Đã tải thông tin '{PoiDetail.Name}'";
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi tải chi tiết POI", ex);
                ErrorMessage = $"❌ Lỗi: {ex.Message}";
                HasError = true;
            }
            finally
            {
                IsLoading = false;
            }
        }

        /// <summary>
        /// Lệnh phát thuyết minh audio
        /// </summary>
        [RelayCommand]
        public void PlayAudio()
        {
            try
            {
                if (PoiDetail == null)
                {
                    ErrorMessage = "❌ Chưa có thông tin POI";
                    HasError = true;
                    return;
                }

                if (string.IsNullOrWhiteSpace(PoiDetail.AudioUrl))
                {
                    ErrorMessage = "❌ POI này không có file audio";
                    HasError = true;
                    return;
                }

                // Tạo AudioContent
                var audioContent = new AudioContent
                {
                    PoiId = PoiDetail.PoiId,
                    PoiName = PoiDetail.Name,
                    LanguageCode = PoiDetail.LanguageCode,
                    TextDescription = PoiDetail.TextDescription,
                    AudioUrl = PoiDetail.AudioUrl,
                    DurationInSeconds = PoiDetail.DurationInSeconds
                };

                // Thêm vào hàng đợi
                bool added = _audioQueueService.TryEnqueueAudio(audioContent);
                if (added)
                {
                    LoadingMessage = $"🎵 Đã thêm thuyết minh vào hàng đợi phát";
                    Constants.DebugLog($"✅ Thêm audio vào hàng đợi: {PoiDetail.Name}");
                    CheckCooldownStatus();
                }
                else
                {
                    var remaining = _audioQueueService.GetCooldownRemaining(PoiDetail.PoiId);
                    CooldownMessage = $"⏳ Phải chờ {remaining.TotalSeconds:F0} giây nữa (cooldown chống spam)";
                    IsInCooldown = true;
                    Constants.DebugLog($"⏳ POI trong cooldown, còn lại {remaining.TotalSeconds:F0}s");
                }
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi phát audio", ex);
                ErrorMessage = $"❌ Lỗi: {ex.Message}";
                HasError = true;
            }
        }

        /// <summary>
        /// Lệnh chia sẻ POI
        /// </summary>
        [RelayCommand]
        public async Task SharePoiAsync()
        {
            try
            {
                if (PoiDetail == null) return;

                var text = $"Mình vừa tìm thấy địa điểm: {PoiDetail.Name}\n" +
                          $"Vĩ độ: {PoiDetail.Latitude}\n" +
                          $"Kinh độ: {PoiDetail.Longitude}\n" +
                          $"Mô tả: {PoiDetail.TextDescription}";

                await Share.RequestAsync(new ShareTextRequest
                {
                    Text = text,
                    Title = "Chia sẻ địa điểm du lịch"
                });

                Constants.DebugLog($"📤 Đã chia sẻ POI: {PoiDetail.Name}");
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi chia sẻ POI", ex);
            }
        }

        // ========== Private Methods ==========

        /// <summary>
        /// Kiểm tra xem POI có đang trong cooldown không
        /// </summary>
        private void CheckCooldownStatus()
        {
            if (PoiDetail == null) return;

            if (_audioQueueService.CanEnqueuePoi(PoiDetail.PoiId))
            {
                IsInCooldown = false;
                CooldownMessage = string.Empty;
            }
            else
            {
                var remaining = _audioQueueService.GetCooldownRemaining(PoiDetail.PoiId);
                IsInCooldown = true;
                CooldownMessage = $"⏳ Cooldown: {remaining.TotalSeconds:F0}s còn lại";
            }
        }

        /// <summary>
        /// Xử lý event khi ngôn ngữ thay đổi
        /// </summary>
        private void OnLanguageChanged(object? sender, LanguageChangedEventArgs args)
        {
            CurrentLanguage = args.NewLanguage;
            Constants.DebugLog($"🌍 PoiDetailViewModel nhận thông báo thay đổi ngôn ngữ: {args.NewLanguage}");

            // Tải lại POI detail với ngôn ngữ mới
            if (PoiDetail != null)
            {
                MainThread.BeginInvokeOnMainThread(async () =>
                {
                    await LoadPoiDetailAsync(PoiDetail.PoiId);
                });
            }
        }
    }
}
