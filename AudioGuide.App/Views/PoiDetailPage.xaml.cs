// File: AudioGuide.App/Views/PoiDetailPage.xaml.cs
using AudioGuide.App.ViewModels;
using AudioGuide.App.Helpers;

namespace AudioGuide.App.Views
{
    /// <summary>
    /// PoiDetailPage - Hiển thị chi tiết một POI với thuyết minh audio
    /// </summary>
    public partial class PoiDetailPage : ContentPage
    {
        private readonly PoiDetailViewModel _viewModel;

        public PoiDetailPage(PoiDetailViewModel viewModel)
        {
            InitializeComponent();

            _viewModel = viewModel;
            BindingContext = viewModel;

            Constants.DebugLog("📋 PoiDetailPage đã được khởi tạo");
        }

        /// <summary>
        /// Khi page được hiển thị từ MapPage, nhận POI ID và tải chi tiết
        /// </summary>
        protected override async void OnAppearing()
        {
            base.OnAppearing();

            try
            {
                // TODO: Nhận POI ID từ shell route parameters
                // if (Shell.Current.CurrentState is RouteShellState shellState)
                // {
                //     var parameters = shellState.Location.GeneratedParameters;
                //     if (parameters.ContainsKey("poiId") && Guid.TryParse(parameters["poiId"].ToString(), out var poiId))
                //     {
                //         await _viewModel.LoadPoiDetailCommand.ExecuteAsync(poiId);
                //     }
                // }

                // For testing: load a test POI
                // var testPoiId = Guid.NewGuid();
                // await _viewModel.LoadPoiDetailCommand.ExecuteAsync(testPoiId);
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi tải POI detail", ex);
            }
        }
    }
}
