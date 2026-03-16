using System;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace WeatherApp
{
    /// <summary>
    /// Service để gọi OpenWeather API
    /// </summary>
    public class ApiService
    {
        private const string API_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
        private const string API_KEY = "865c114bcf48a81c5ac9b784b2150e29"; // API key OpenWeather miễn phí
        private static readonly HttpClient client = new HttpClient();

        /// <summary>
        /// Lấy thông tin thời tiết của một thành phố
        /// </summary>
        public async Task<WeatherData> GetWeatherByCityAsync(string cityName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(cityName))
                {
                    throw new ArgumentException("Tên thành phố không được để trống");
                }

                // Xây dựng URL với các parameter
                string url = $"{API_BASE_URL}?q={Uri.EscapeDataString(cityName)}&appid={API_KEY}&units=metric&lang=vi";

                // Gửi request
                HttpResponseMessage response = await client.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Lỗi API: {response.StatusCode} - {response.ReasonPhrase}");
                }

                // Đọc nội dung response
                string jsonContent = await response.Content.ReadAsStringAsync();

                // Parse JSON
                OpenWeatherResponse weatherResponse = JsonConvert.DeserializeObject<OpenWeatherResponse>(jsonContent);

                // Chuyển đổi sang WeatherData
                WeatherData weatherData = new WeatherData
                {
                    City = weatherResponse.Name,
                    Temperature = weatherResponse.Main.Temp,
                    Humidity = weatherResponse.Main.Humidity,
                    WindSpeed = weatherResponse.Wind.Speed,
                    Description = weatherResponse.Weather[0].Description,
                    Icon = weatherResponse.Weather[0].Icon
                };

                return weatherData;
            }
            catch (HttpRequestException ex)
            {
                throw new Exception($"Lỗi kết nối: {ex.Message}");
            }
            catch (JsonException ex)
            {
                throw new Exception($"Lỗi parse JSON: {ex.Message}");
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi: {ex.Message}");
            }
        }

        /// <summary>
        /// Lấy URL của icon thời tiết từ OpenWeather
        /// </summary>
        public string GetWeatherIconUrl(string iconCode)
        {
            return $"https://openweathermap.org/img/wn/{iconCode}@2x.png";
        }
    }
}
