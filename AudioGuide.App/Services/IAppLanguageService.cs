// File: AudioGuide.App/Services/IAppLanguageService.cs
namespace AudioGuide.App.Services
{
    /// <summary>
    /// Event args khi ngôn ngữ được thay đổi
    /// </summary>
    public class LanguageChangedEventArgs : EventArgs
    {
        public string OldLanguage { get; set; } = string.Empty;
        public string NewLanguage { get; set; } = string.Empty;
    }

    /// <summary>
    /// Interface định nghĩa App Language service
    /// Quản lý ngôn ngữ được chọn, lưu vào Preferences
    /// </summary>
    public interface IAppLanguageService
    {
        /// <summary>
        /// Lấy ngôn ngữ hiện tại được sử dụng
        /// </summary>
        /// <returns>Mã ngôn ngữ (ví dụ: "vi", "en", "jp")</returns>
        string GetCurrentLanguage();

        /// <summary>
        /// Đặt ngôn ngữ hiện tại
        /// Lưu vào Preferences để duy trì qua các lần khởi động
        /// </summary>
        /// <param name="languageCode">Mã ngôn ngữ cần đặt</param>
        void SetLanguage(string languageCode);

        /// <summary>
        /// Lấy tên hiển thị của ngôn ngữ
        /// </summary>
        /// <param name="languageCode">Mã ngôn ngữ</param>
        /// <returns>Tên hiển thị (ví dụ: "Tiếng Việt", "English")</returns>
        string GetLanguageDisplayName(string languageCode);

        /// <summary>
        /// Lấy danh sách tất cả ngôn ngữ được hỗ trợ
        /// </summary>
        /// <returns>Danh sách mã ngôn ngữ</returns>
        string[] GetSupportedLanguages();

        /// <summary>
        /// Lấy dictionary ánh xạ mã ngôn ngữ → tên hiển thị
        /// </summary>
        /// <returns>Dictionary ngôn ngữ</returns>
        Dictionary<string, string> GetLanguageDictionary();

        /// <summary>
        /// Event bắn khi ngôn ngữ được thay đổi
        /// </summary>
        event EventHandler<LanguageChangedEventArgs>? OnLanguageChanged;
    }
}
