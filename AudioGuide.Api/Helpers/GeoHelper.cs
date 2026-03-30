// File: AudioGuide.Api/Helpers/GeoHelper.cs
namespace AudioGuide.Api.Helpers
{
    /// <summary>
    /// Helper class chứa các phương thức hỗ trợ xử lý địa lý (GPS)
    /// </summary>
    public static class GeoHelper
    {
        /// <summary>
        /// Bán kính Trái Đất (km)
        /// </summary>
        private const double EarthRadiusKm = 6371.0;

        /// <summary>
        /// Tính toán khoảng cách giữa 2 điểm GPS sử dụng công thức Haversine
        /// </summary>
        /// <param name="userLatitude">Vĩ độ của người dùng</param>
        /// <param name="userLongitude">Kinh độ của người dùng</param>
        /// <param name="poiLatitude">Vĩ độ của POI</param>
        /// <param name="poiLongitude">Kinh độ của POI</param>
        /// <returns>Khoảng cách tính bằng mét</returns>
        public static double CalculateDistanceInMeters(
            decimal userLatitude,
            decimal userLongitude,
            decimal poiLatitude,
            decimal poiLongitude)
        {
            var dLat = DegreesToRadians((double)(poiLatitude - userLatitude));
            var dLng = DegreesToRadians((double)(poiLongitude - userLongitude));

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(DegreesToRadians((double)userLatitude)) *
                    Math.Cos(DegreesToRadians((double)poiLatitude)) *
                    Math.Sin(dLng / 2) * Math.Sin(dLng / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            var distanceKm = EarthRadiusKm * c;

            return distanceKm * 1000; // Chuyển sang mét
        }

        /// <summary>
        /// Chuyển đổi độ sang radian
        /// </summary>
        private static double DegreesToRadians(double degrees)
        {
            return degrees * Math.PI / 180.0;
        }

        /// <summary>
        /// Tính toán bounding box từ một điểm tâm và bán kính
        /// Dùng để tối ưu truy vấn cơ sở dữ liệu
        /// </summary>
        /// <param name="centerLatitude">Vĩ độ tâm</param>
        /// <param name="centerLongitude">Kinh độ tâm</param>
        /// <param name="radiusInMeters">Bán kính (mét)</param>
        /// <returns>Tuple chứa (minLat, maxLat, minLng, maxLng)</returns>
        public static (decimal minLat, decimal maxLat, decimal minLng, decimal maxLng) CalculateBoundingBox(
            decimal centerLatitude,
            decimal centerLongitude,
            int radiusInMeters)
        {
            // 111 km = 1 độ vĩ độ
            var latOffset = (radiusInMeters / 111000.0);

            // Kinh độ offset phụ thuộc vào vĩ độ (do trái đất hình cầu)
            var lngOffset = (radiusInMeters / (111000.0 * Math.Cos((double)centerLatitude * Math.PI / 180.0)));

            var minLat = centerLatitude - (decimal)latOffset;
            var maxLat = centerLatitude + (decimal)latOffset;
            var minLng = centerLongitude - (decimal)lngOffset;
            var maxLng = centerLongitude + (decimal)lngOffset;

            return (minLat, maxLat, minLng, maxLng);
        }

        /// <summary>
        /// Validate tọa độ GPS
        /// </summary>
        /// <param name="latitude">Vĩ độ</param>
        /// <param name="longitude">Kinh độ</param>
        /// <returns>True nếu tọa độ hợp lệ, False nếu không</returns>
        public static bool IsValidCoordinate(decimal latitude, decimal longitude)
        {
            return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
        }

        /// <summary>
        /// Format khoảng cách thành chuỗi dễ đọc (ví dụ: "1.5 km", "500 m")
        /// </summary>
        /// <param name="distanceInMeters">Khoảng cách tính bằng mét</param>
        /// <returns>Chuỗi formatted</returns>
        public static string FormatDistance(double distanceInMeters)
        {
            if (distanceInMeters < 1000)
            {
                return $"{(int)distanceInMeters} m";
            }
            else
            {
                var km = distanceInMeters / 1000.0;
                return $"{km:F1} km";
            }
        }
    }
}
