// File: AudioGuide.App/ViewModels/MapViewModel.cs
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AudioGuide.App.Helpers;
using AudioGuide.App.Models;
using AudioGuide.App.Services;
using System.Collections.ObjectModel;

namespace AudioGuide.App.ViewModels
{
    /// <summary>
    /// ViewModel quản lý bản đồ và danh sách POI gần vị trí hiện tại
    /// Lắng nghe geofence events, update danh sách POI
    /// </summary>
    public partial class MapViewModel : ObservableObject
    {
        private readonly IApiService _apiService;
        private readonly IGeofenceService _geofenceService;
        private readonly IAudioQueueService _audioQueueService;
        private readonly IAppLanguageService _languageService;

        // ========== Observable Properties ==========
        [ObservableProperty]
        private ObservableCollection<PoiMapDto> nearbyPois = new();

        [ObservableProperty]
        private bool isLoading = false;

        [ObservableProperty]
        private string loadingMessage = "Đang tải dữ liệu...";

        [ObservableProperty]
        private string errorMessage = string.Empty;

        [ObservableProperty]
        private bool hasError = false;

        [ObservableProperty]
        private decimal userLatitude = 0;

        [ObservableProperty]
        private decimal userLongitude = 0;

        [ObservableProperty]
        private int searchRadius = Constants.DefaultSearchRadiusMeters;

        [ObservableProperty]
        private string currentLanguage = "vi";

        [ObservableProperty]
        private bool isGeofencingActive = false;

        [ObservableProperty]
        private int poiCount = 0;

        public MapViewModel(
            IApiService apiService,
            IGeofenceService geofenceService,
            IAudioQueueService audioQueueService,
            IAppLanguageService languageService)
        {
            _apiService = apiService;
            _geofenceService = geofenceService;
            _audioQueueService = audioQueueService;
            _languageService = languageService;

            CurrentLanguage = _languageService.GetCurrentLanguage();

            Constants.DebugLog("🗺️ MapViewModel đã được khởi tạo");

            // Subscribe to events
            _languageService.OnLanguageChanged += OnLanguageChanged;
            _geofenceService.OnGeofenceEntered += OnGeofenceEntered;
            _geofenceService.OnGeofenceExited += OnGeofenceExited;
        }

        // ========== Commands ==========

        /// <summary>
        /// Lệnh tìm kiếm POI gần vị trí
        /// </summary>
        [RelayCommand]
        public async Task SearchNearbyPoisAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = $"🔍 Tìm kiếm POI trong bán kính {SearchRadius}m...";
                HasError = false;
                ErrorMessage = string.Empty;

                Constants.DebugLog($"Tìm POI gần vị trí: lat={UserLatitude}, lng={UserLongitude}");

                // Kiểm tra vị trí hợp lệ
                if (UserLatitude == 0 && UserLongitude == 0)
                {
                    throw new InvalidOperationException("Vui lòng cấp quyền định vị GPS");
                }

                // Gọi API
                var response = await _apiService.GetNearbyPoisAsync(
                    UserLatitude,
                    UserLongitude,
                    SearchRadius
                );

                if (!response.Success || response.Data == null)
                {
                    throw new Exception(response.Message ?? "Không thể lấy danh sách POI");
                }

                // Update UI
                NearbyPois.Clear();
                foreach (var poi in response.Data)
                {
                    NearbyPois.Add(poi);
                }

                PoiCount = NearbyPois.Count;

                if (PoiCount == 0)
                {
                    ErrorMessage = $"❌ Không tìm thấy điểm du lịch nào trong bán kính {SearchRadius}m";
                    HasError = true;
                }
                else
                {
                    LoadingMessage = $"✅ Tìm thấy {PoiCount} điểm du lịch";
                    Constants.DebugLog($"✅ Tìm thấy {PoiCount} POI");

                    // Bắt đầu geofencing
                    await StartGeofencingAsync();
                }
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi tìm POI", ex);
                ErrorMessage = $"❌ Lỗi: {ex.Message}";
                HasError = true;
            }
            finally
            {
                IsLoading = false;
            }
        }

        /// <summary>
        /// Lệnh bắt đầu geofencing
        /// </summary>
        [RelayCommand]
        public async Task StartGeofencingAsync()
        {
            try
            {
                if (NearbyPois.Count == 0)
                {
                    Constants.DebugLog("⚠️ Danh sách POI trống, không thể bắt đầu geofencing");
                    return;
                }

                Constants.DebugLog($"🚀 Bắt đầu geofencing cho {NearbyPois.Count} POI");
                await _geofenceService.StartGeofencingAsync(NearbyPois.ToList());
                IsGeofencingActive = _geofenceService.IsGeofencingActive;

                if (IsGeofencingActive)
                {
                    LoadingMessage = "✅ Geofencing hoạt động - Sẵn sàng nhận thông báo";
                }
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi bắt đầu geofencing", ex);
                ErrorMessage = $"❌ Lỗi geofencing: {ex.Message}";
                HasError = true;
            }
        }

        /// <summary>
        /// Lệnh dừng geofencing
        /// </summary>
        [RelayCommand]
        public async Task StopGeofencingAsync()
        {
            try
            {
                Constants.DebugLog("🛑 Dừng geofencing");
                await _geofenceService.StopGeofencingAsync();
                IsGeofencingActive = false;
                LoadingMessage = "⏸️ Geofencing đã được dừng";
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi dừng geofencing", ex);
            }
        }

        /// <summary>
        /// Lệnh tăng/giảm bán kính tìm kiếm
        /// </summary>
        [RelayCommand]
        public async Task UpdateSearchRadiusAsync(int radius)
        {
            if (radius < Constants.MinSearchRadiusMeters || radius > Constants.MaxSearchRadiusMeters)
            {
                ErrorMessage = $"❌ Bán kính phải từ {Constants.MinSearchRadiusMeters}m đến {Constants.MaxSearchRadiusMeters}m";
                HasError = true;
                return;
            }

            SearchRadius = radius;
            await SearchNearbyPoisAsync();
        }

        /// <summary>
        /// Lệnh refresh danh sách POI
        /// </summary>
        [RelayCommand]
        public async Task RefreshAsync()
        {
            Constants.DebugLog("🔄 Refresh danh sách POI");
            await SearchNearbyPoisAsync();
        }

        // ========== Event Handlers ==========

        /// <summary>
        /// Xử lý event khi ngôn ngữ thay đổi
        /// </summary>
        private void OnLanguageChanged(object? sender, LanguageChangedEventArgs args)
        {
            CurrentLanguage = args.NewLanguage;
            Constants.DebugLog($"🌍 MapViewModel nhận thông báo thay đổi ngôn ngữ: {args.NewLanguage}");

            // Có thể gọi lại API với ngôn ngữ mới
            MainThread.BeginInvokeOnMainThread(async () =>
            {
                await SearchNearbyPoisAsync();
            });
        }

        /// <summary>
        /// Xử lý event khi người dùng vào một geofence
        /// </summary>
        private void OnGeofenceEntered(object? sender, GeofenceEventArgs args)
        {
            Constants.DebugLog($"🚪 MapViewModel: Người dùng vào geofence '{args.PoiName}'");

            // Tự động tải chi tiết POI và thêm vào hàng đợi audio
            MainThread.BeginInvokeOnMainThread(async () =>
            {
                try
                {
                    var poiResponse = await _apiService.GetPoiDetailAsync(args.PoiId, CurrentLanguage);
                    if (poiResponse?.Success == true && poiResponse.Data != null)
                    {
                        // Chuyển PoiDetailDto → AudioContent
                        var audioContent = new AudioContent
                        {
                            PoiId = poiResponse.Data.PoiId,
                            PoiName = poiResponse.Data.Name,
                            LanguageCode = poiResponse.Data.LanguageCode,
                            TextDescription = poiResponse.Data.TextDescription,
                            AudioUrl = poiResponse.Data.AudioUrl,
                            DurationInSeconds = poiResponse.Data.DurationInSeconds
                        };

                        // Thêm vào hàng đợi
                        bool enqueued = _audioQueueService.TryEnqueueAudio(audioContent);
                        if (enqueued)
                        {
                            LoadingMessage = $"🎵 Đã thêm '{args.PoiName}' vào hàng đợi phát";
                        }
                        else
                        {
                            var remaining = _audioQueueService.GetCooldownRemaining(args.PoiId);
                            LoadingMessage = $"⏳ '{args.PoiName}' đang trong cooldown. Chờ {remaining.TotalSeconds:F0}s nữa";
                        }
                    }
                }
                catch (Exception ex)
                {
                    Constants.ErrorLog($"❌ Lỗi khi xử lý geofence entered", ex);
                }
            });
        }

        /// <summary>
        /// Xử lý event khi người dùng ra khỏi một geofence
        /// </summary>
        private void OnGeofenceExited(object? sender, GeofenceEventArgs args)
        {
            Constants.DebugLog($"🚪 MapViewModel: Người dùng ra khỏi geofence '{args.PoiName}'");
            LoadingMessage = $"👋 Đã rời khỏi '{args.PoiName}'";
        }

        /// <summary>
        /// Update vị trí người dùng từ GPS
        /// </summary>
        public void UpdateUserLocation(decimal latitude, decimal longitude)
        {
            // Kiểm tra độ chính xác thay đổi
            if (Math.Abs(UserLatitude - latitude) > 0.001m || Math.Abs(UserLongitude - longitude) > 0.001m)
            {
                UserLatitude = latitude;
                UserLongitude = longitude;
                Constants.DebugLog($"📍 Cập nhật vị trí: {latitude:F6}, {longitude:F6}");
            }
        }
    }
}
