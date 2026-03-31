using AudioGuide.WinForms.Helpers;

namespace AudioGuide.WinForms.Services
{
    /// <summary>
    /// Service for startup checks (API health, connectivity)
    /// Runs checks in background on application startup
    /// </summary>
    public class StartupService
    {
        private readonly IApiService _apiService;

        public StartupService(IApiService apiService)
        {
            _apiService = apiService;
        }

        /// <summary>
        /// Perform API health check asynchronously
        /// </summary>
        public async Task<bool> CheckApiHealthAsync()
        {
            try
            {
                Constants.DebugLog("🏥 Kiểm tra tình trạng API...");
                var isHealthy = await _apiService.HealthCheckAsync();

                if (isHealthy)
                {
                    Constants.DebugLog("✅ Backend API khỏe");
                    return true;
                }
                else
                {
                    Constants.DebugLog("⚠️ Backend API không hoạt động");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi kiểm tra API", ex);
                return false;
            }
        }

        /// <summary>
        /// Run all startup verification tasks (in background)
        /// </summary>
        public async Task RunStartupChecksAsync()
        {
            try
            {
                Constants.DebugLog("🚀 Bắt đầu kiểm tra khởi động ứng dụng");

                // Run health check in background (don't wait for it)
                _ = CheckApiHealthAsync().ContinueWith(task =>
                {
                    if (!task.IsCompletedSuccessfully || !task.Result)
                    {
                        Constants.DebugLog("⚠️ Cảnh báo: API không sẵn sàng");
                    }
                });

                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi trong kiểm tra khởi động", ex);
            }
        }
    }
}
