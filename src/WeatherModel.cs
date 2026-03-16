using System;

namespace WeatherApp
{
    /// <summary>
    /// Model lưu trữ thông tin thời tiết
    /// </summary>
    public class WeatherData
    {
        public string City { get; set; }
        public double Temperature { get; set; }
        public int Humidity { get; set; }
        public double WindSpeed { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public DateTime LastUpdated { get; set; }

        public WeatherData()
        {
            LastUpdated = DateTime.Now;
        }

        public override string ToString()
        {
            return $"{City} - {Temperature}°C";
        }
    }

    /// <summary>
    /// Model cho API Response từ OpenWeather API
    /// </summary>
    public class OpenWeatherResponse
    {
        public Main Main { get; set; }
        public Weather[] Weather { get; set; }
        public Wind Wind { get; set; }
        public string Name { get; set; }
    }

    public class Main
    {
        public double Temp { get; set; }
        public int Humidity { get; set; }
    }

    public class Weather
    {
        public string Main { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
    }

    public class Wind
    {
        public double Speed { get; set; }
    }
}
