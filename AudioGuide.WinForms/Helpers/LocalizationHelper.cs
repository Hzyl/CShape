using System.Collections.Concurrent;
using System.Globalization;
using System.Resources;

namespace AudioGuide.WinForms.Helpers
{
    /// <summary>
    /// Helper class for loading localized strings from .resx files
    /// Supports VI (Vietnamese), EN (English), JP (Japanese)
    /// </summary>
    public static class LocalizationHelper
    {
        private static readonly ConcurrentDictionary<string, ResourceManager?> _resourceManagers = new();
        private static readonly object _lockObject = new();
        private static string _currentLanguage = "vi";

        /// <summary>
        /// Initialize localization with current language from AppLanguageService
        /// </summary>
        public static void Initialize(string language)
        {
            _currentLanguage = language.ToLower();
            Constants.DebugLog($"🌍 Localization initialized with language: {_currentLanguage}");
        }

        /// <summary>
        /// Set current language (called when user changes language setting)
        /// </summary>
        public static void SetCurrentLanguage(string language)
        {
            _currentLanguage = language.ToLower();
            Constants.DebugLog($"🌍 Localization language changed to: {_currentLanguage}");
        }

        /// <summary>
        /// Get localized string from resources
        /// </summary>
        /// <param name="key">Resource key (e.g., "MapPage_Title")</param>
        /// <param name="culture">Culture code (optional, uses current if not specified)</param>
        /// <returns>Localized string or key if not found</returns>
        public static string GetString(string key, string? culture = null)
        {
            try
            {
                // Use current language if not specified
                culture ??= _currentLanguage;
                culture = culture.ToLower();

                // Validate culture code
                if (!Constants.SupportedLanguages.Contains(culture))
                {
                    culture = "vi"; // Fallback to Vietnamese
                }

                // Get or create ResourceManager for this culture
                var rm = GetResourceManager(culture);
                if (rm == null)
                {
                    return key; // Fallback: return key if ResourceManager not found
                }

                // Get string from resource
                var result = rm.GetString(key, new CultureInfo(GetCultureCode(culture)));

                return result ?? key; // Fallback: return key if not found
            }
            catch (Exception ex)
            {
                Constants.ErrorLog($"❌ Error loading localized string for key '{key}'", ex);
                return key; // Fallback: return key
            }
        }

        /// <summary>
        /// Get localized string with format parameters
        /// </summary>
        public static string GetStringFormat(string key, params object[] args)
        {
            try
            {
                var format = GetString(key);
                return string.Format(format, args);
            }
            catch (Exception ex)
            {
                Constants.ErrorLog($"❌ Error formatting localized string for key '{key}'", ex);
                return key;
            }
        }

        /// <summary>
        /// Get ResourceManager for specified culture (cached for performance)
        /// </summary>
        private static ResourceManager? GetResourceManager(string culture)
        {
            return _resourceManagers.GetOrAdd(culture, c =>
            {
                try
                {
                    lock (_lockObject)
                    {
                        // Create ResourceManager for .resx file
                        // Assembly type must point to the project assembly
                        var resourceName = $"AudioGuide.WinForms.Resources.Strings.{GetCultureSuffix(c)}";
                        var rm = new ResourceManager(resourceName, typeof(LocalizationHelper).Assembly);

                        // Test if resource exists by attempting to load a known key
                        var test = rm.GetString("MainForm_Title", new CultureInfo(GetCultureCode(c)));
                        if (test != null)
                        {
                            Constants.DebugLog($"✅ ResourceManager loaded for culture: {c}");
                            return rm;
                        }

                        Constants.DebugLog($"⚠️ ResourceManager not found for culture: {c}");
                        return null;
                    }
                }
                catch (Exception ex)
                {
                    Constants.ErrorLog($"❌ Error creating ResourceManager for culture '{c}'", ex);
                    return null;
                }
            });
        }

        /// <summary>
        /// Convert language code to culture code (vi -> vi-VN, en -> en-US, jp -> ja-JP)
        /// </summary>
        private static string GetCultureCode(string language)
        {
            return language.ToLower() switch
            {
                "vi" => "vi-VN",
                "en" => "en-US",
                "jp" or "ja" => "ja-JP",
                _ => "vi-VN" // Default to Vietnamese
            };
        }

        /// <summary>
        /// Convert language code to .resx filename suffix (vi -> vi, en -> en, jp -> jp)
        /// </summary>
        private static string GetCultureSuffix(string culture)
        {
            return culture.ToLower() switch
            {
                "vi" or "vi-vn" => "vi",
                "en" or "en-us" => "en",
                "jp" or "ja" or "ja-jp" => "jp",
                _ => "vi" // Default to Vietnamese
            };
        }

        /// <summary>
        /// Get all supported languages as dictionary
        /// </summary>
        public static Dictionary<string, string> GetSupportedLanguages()
        {
            var languages = new Dictionary<string, string>();
            foreach (var lang in Constants.SupportedLanguages)
            {
                var displayName = GetString($"SettingsPage_Language{lang.ToUpper()}");
                languages[lang] = displayName;
            }
            return languages;
        }

        /// <summary>
        /// Clear cached ResourceManagers (useful for testing or language reload)
        /// </summary>
        public static void ClearCache()
        {
            _resourceManagers.Clear();
            Constants.DebugLog("🧹 Localization resource cache cleared");
        }
    }
}
