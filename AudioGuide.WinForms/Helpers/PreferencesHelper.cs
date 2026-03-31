namespace AudioGuide.WinForms.Helpers
{
    /// <summary>
    /// Helper class để lưu và đọc preferences từ AppData
    /// Thay thế cho MAUI's Preferences API
    /// </summary>
    public static class PreferencesHelper
    {
        private static readonly string AppDataPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "AudioGuide"
        );

        static PreferencesHelper()
        {
            if (!Directory.Exists(AppDataPath))
            {
                Directory.CreateDirectory(AppDataPath);
            }
        }

        /// <summary>
        /// Lấy giá trị từ preferences
        /// </summary>
        public static string Get(string key, string defaultValue = "")
        {
            try
            {
                var filePath = Path.Combine(AppDataPath, $"{key}.txt");
                if (File.Exists(filePath))
                {
                    return File.ReadAllText(filePath).Trim();
                }
            }
            catch (Exception ex)
            {
                Constants.ErrorLog($"Lỗi khi đọc preference: {key}", ex);
            }

            return defaultValue;
        }

        /// <summary>
        /// Lưu giá trị vào preferences
        /// </summary>
        public static void Set(string key, string value)
        {
            try
            {
                var filePath = Path.Combine(AppDataPath, $"{key}.txt");
                File.WriteAllText(filePath, value);
            }
            catch (Exception ex)
            {
                Constants.ErrorLog($"Lỗi khi lưu preference: {key}", ex);
            }
        }

        /// <summary>
        /// Xóa một preference
        /// </summary>
        public static void Remove(string key)
        {
            try
            {
                var filePath = Path.Combine(AppDataPath, $"{key}.txt");
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }
            }
            catch (Exception ex)
            {
                Constants.ErrorLog($"Lỗi khi xóa preference: {key}", ex);
            }
        }

        /// <summary>
        /// Kiểm tra xem preference có tồn tại không
        /// </summary>
        public static bool ContainsKey(string key)
        {
            try
            {
                var filePath = Path.Combine(AppDataPath, $"{key}.txt");
                return File.Exists(filePath);
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Xóa tất cả preferences
        /// </summary>
        public static void Clear()
        {
            try
            {
                if (Directory.Exists(AppDataPath))
                {
                    var files = Directory.GetFiles(AppDataPath);
                    foreach (var file in files)
                    {
                        File.Delete(file);
                    }
                }
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("Lỗi khi xóa tất cả preferences", ex);
            }
        }
    }
}
