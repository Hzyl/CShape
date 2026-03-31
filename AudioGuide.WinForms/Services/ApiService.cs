using Newtonsoft.Json;
using AudioGuide.WinForms.Helpers;
using AudioGuide.WinForms.Models;

namespace AudioGuide.WinForms.Services
{
    /// <summary>
    /// Thực thi IApiService - Gọi Backend API qua HTTP
    /// Xử lý serialization/deserialization JSON
    /// Xử lý errors và exceptions
    /// </summary>
    public class ApiService : IApiService
    {
        private readonly HttpClient _httpClient;

        public ApiService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        /// <summary>
        /// Lấy danh sách POI gần vị trí hiện tại
        /// </summary>
        public async Task<ApiResponse<List<PoiMapDto>>> GetNearbyPoisAsync(decimal latitude, decimal longitude, int radius)
        {
            try
            {
                Constants.DebugLog($"📍 Gọi API GetNearbyPois: lat={latitude}, lng={longitude}, radius={radius}m");

                // Tạo URL request
                var url = $"/api/pois/nearby?lat={latitude}&lng={longitude}&radius={radius}";

                // Gọi API
                var response = await _httpClient.GetAsync(url);

                // Xử lý response
                return await HandleResponse<List<PoiMapDto>>(response);
            }
            catch (Exception ex)
            {
                Constants.ErrorLog($"❌ Lỗi khi gọi GetNearbyPois", ex);
                return new ApiResponse<List<PoiMapDto>>
                {
                    Success = false,
                    Message = $"Lỗi kết nối: {ex.Message}",
                    Data = new List<PoiMapDto>()
                };
            }
        }

        /// <summary>
        /// Lấy chi tiết POI với hỗ trợ đa ngôn ngữ
        /// </summary>
        public async Task<ApiResponse<PoiDetailDto>> GetPoiDetailAsync(Guid poiId, string language)
        {
            try
            {
                Constants.DebugLog($"📋 Gọi API GetPoiDetail: poiId={poiId}, language={language}");

                // Tạo URL request
                var url = $"/api/pois/{poiId}?lang={language}";

                // Gọi API
                var response = await _httpClient.GetAsync(url);

                // Xử lý response
                return await HandleResponse<PoiDetailDto>(response);
            }
            catch (Exception ex)
            {
                Constants.ErrorLog($"❌ Lỗi khi gọi GetPoiDetail", ex);
                return new ApiResponse<PoiDetailDto>
                {
                    Success = false,
                    Message = $"Lỗi kết nối: {ex.Message}",
                    Data = null
                };
            }
        }

        /// <summary>
        /// Lấy POI thông qua QR Code Hash
        /// </summary>
        public async Task<ApiResponse<PoiDetailDto>> GetPoiByQrCodeAsync(string qrHash, string language)
        {
            try
            {
                Constants.DebugLog($"🔲 Gọi API GetPoiByQrCode: qrHash={qrHash}, language={language}");

                // Validate input
                if (string.IsNullOrWhiteSpace(qrHash))
                {
                    throw new ArgumentNullException(nameof(qrHash), "QR Hash không được để trống");
                }

                // Tạo URL request
                var url = $"/api/pois/qr/{Uri.EscapeDataString(qrHash)}?lang={language}";

                // Gọi API
                var response = await _httpClient.GetAsync(url);

                // Xử lý response
                return await HandleResponse<PoiDetailDto>(response);
            }
            catch (Exception ex)
            {
                Constants.ErrorLog($"❌ Lỗi khi gọi GetPoiByQrCode", ex);
                return new ApiResponse<PoiDetailDto>
                {
                    Success = false,
                    Message = $"Lỗi kết nối: {ex.Message}",
                    Data = null
                };
            }
        }

        /// <summary>
        /// Kiểm tra API có hoạt động không
        /// </summary>
        public async Task<bool> HealthCheckAsync()
        {
            try
            {
                Constants.DebugLog("🏥 Thực hiện Health Check tới Backend API");

                var response = await _httpClient.GetAsync("/api/pois/health");
                bool isHealthy = response.IsSuccessStatusCode;

                if (isHealthy)
                {
                    Constants.DebugLog("✅ Backend API healthy");
                }
                else
                {
                    Constants.ErrorLog($"⚠️ Backend API unhealthy: status={response.StatusCode}");
                }

                return isHealthy;
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi thực hiện Health Check", ex);
                return false;
            }
        }

        /// <summary>
        /// Xử lý HTTP response - deserialize JSON
        /// </summary>
        private static async Task<ApiResponse<T>> HandleResponse<T>(HttpResponseMessage response)
        {
            try
            {
                var content = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    // Deserialize successful response
                    var apiResponse = JsonConvert.DeserializeObject<ApiResponse<T>>(content);
                    return apiResponse ?? new ApiResponse<T>
                    {
                        Success = false,
                        Message = "Lỗi: Không thể deserialize response",
                        Data = default
                    };
                }
                else
                {
                    // Handle HTTP errors
                    Constants.ErrorLog($"⚠️ API trả về lỗi HTTP: {response.StatusCode}");

                    return new ApiResponse<T>
                    {
                        Success = false,
                        Message = $"Lỗi API: {response.StatusCode}",
                        Data = default
                    };
                }
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi xử lý response", ex);
                return new ApiResponse<T>
                {
                    Success = false,
                    Message = $"Lỗi xử lý response: {ex.Message}",
                    Data = default
                };
            }
        }
    }
}
