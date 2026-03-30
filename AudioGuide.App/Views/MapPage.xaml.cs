// File: AudioGuide.App/Views/MapPage.xaml.cs
using AudioGuide.App.ViewModels;
using AudioGuide.App.Helpers;

namespace AudioGuide.App.Views
{
    /// <summary>
    /// MapPage - Hiển thị bản đồ với danh sách POI gần vị trí
    /// </summary>
    public partial class MapPage : ContentPage
    {
        private readonly MapViewModel _viewModel;

        public MapPage(MapViewModel viewModel)
        {
            InitializeComponent();

            _viewModel = viewModel;
            BindingContext = viewModel;

            Constants.DebugLog("📍 MapPage đã được khởi tạo");
        }

        /// <summary>
        /// Khi page được hiển thị, cập nhật vị trí người dùng
        /// </summary>
        protected override async void OnAppearing()
        {
            base.OnAppearing();

            Constants.DebugLog("📍 MapPage appearing - cập nhật vị trí GPS");

            try
            {
                // TODO: Integrate with GPS location provider
                // Lấy vị trí hiện tại từ device GPS
                // var location = await Geolocation.GetLocationAsync();
                // if (location != null)
                // {
                //     _viewModel.UpdateUserLocation((decimal)location.Latitude, (decimal)location.Longitude);
                // }

                // For now, use default Hanoi coordinates for testing
                _viewModel.UpdateUserLocation(21.0285M, 105.8542M);

                // Tự động tìm kiếm POI
                await _viewModel.SearchNearbyPoisCommand.ExecuteAsync(null);
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi cập nhật vị trí", ex);
            }
        }

        /// <summary>
        /// Khi page bị ẩn, dừng geofencing nếu cần
        /// </summary>
        protected override void OnDisappearing()
        {
            base.OnDisappearing();

            Constants.DebugLog("📍 MapPage disappearing");

            // Có thể dừng geofencing khi rời khỏi trang
            // await _viewModel.StopGeofencingCommand.ExecuteAsync(null);
        }
    }
}
