using AudioGuide.WinForms.Helpers;

namespace AudioGuide.WinForms.Services
{
    /// <summary>
    /// Thực thi IAppLanguageService - Quản lý ngôn ngữ ứng dụng
    /// </summary>
    public class AppLanguageService : IAppLanguageService
    {
        private string _currentLanguage;

        public event EventHandler<LanguageChangedEventArgs>? OnLanguageChanged;

        public AppLanguageService()
        {
            // Tải ngôn ngữ từ Preferences, mặc định là Tiếng Việt
            _currentLanguage = PreferencesHelper.Get(Constants.PreferenceKeyLanguage, Constants.DefaultLanguage);
            Constants.DebugLog($"🌍 AppLanguageService khởi tạo với ngôn ngữ: {_currentLanguage}");
        }

        /// <summary>
        /// Lấy ngôn ngữ hiện tại
        /// </summary>
        public string GetCurrentLanguage()
        {
            return _currentLanguage;
        }

        /// <summary>
        /// Đặt ngôn ngữ hiện tại và lưu vào Preferences
        /// </summary>
        public void SetLanguage(string languageCode)
        {
            try
            {
                // Validate language code
                if (string.IsNullOrWhiteSpace(languageCode))
                {
                    Constants.DebugLog("⚠️ Mã ngôn ngữ không hợp lệ");
                    return;
                }

                languageCode = languageCode.Trim().ToLower();

                // Kiểm tra xem ngôn ngữ có được hỗ trợ không
                if (!Constants.SupportedLanguages.Contains(languageCode))
                {
                    Constants.DebugLog($"⚠️ Ngôn ngữ '{languageCode}' không được hỗ trợ");
                    return;
                }

                // Nếu ngôn ngữ đã được chọn, không cần làm gì
                if (languageCode == _currentLanguage)
                {
                    Constants.DebugLog($"ℹ️ Ngôn ngữ '{languageCode}' đã được chọn");
                    return;
                }

                // Lưu ngôn ngữ cũ để thông báo event
                var oldLanguage = _currentLanguage;

                // Đặt ngôn ngữ mới
                _currentLanguage = languageCode;

                // Lưu vào Preferences
                PreferencesHelper.Set(Constants.PreferenceKeyLanguage, languageCode);

                Constants.DebugLog($"🌍 Đã đổi ngôn ngữ: {oldLanguage} → {languageCode}");

                // Bắn event thông báo ngôn ngữ đã thay đổi
                OnLanguageChanged?.Invoke(this, new LanguageChangedEventArgs
                {
                    OldLanguage = oldLanguage,
                    NewLanguage = languageCode
                });
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi đặt ngôn ngữ", ex);
            }
        }

        /// <summary>
        /// Lấy tên hiển thị của ngôn ngữ
        /// </summary>
        public string GetLanguageDisplayName(string languageCode)
        {
            if (Constants.LanguageDisplayNames.TryGetValue(languageCode, out var displayName))
            {
                return displayName;
            }

            return languageCode; // Fallback: trả về mã ngôn ngữ
        }

        /// <summary>
        /// Lấy danh sách ngôn ngữ được hỗ trợ
        /// </summary>
        public string[] GetSupportedLanguages()
        {
            return Constants.SupportedLanguages;
        }

        /// <summary>
        /// Lấy dictionary ngôn ngữ
        /// </summary>
        public Dictionary<string, string> GetLanguageDictionary()
        {
            return Constants.LanguageDisplayNames;
        }
    }
}
