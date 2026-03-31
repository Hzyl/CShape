namespace AudioGuide.WinForms.Helpers
{
    /// <summary>
    /// Centralized error, warning, and info message box display
    /// Provides consistent UI for user feedback
    /// </summary>
    public static class DialogHelper
    {
        /// <summary>
        /// Show error MessageBox with exception details
        /// </summary>
        public static void ShowError(string title, string message, Exception? ex = null)
        {
            try
            {
                var fullMessage = ex != null
                    ? $"{message}\n\n🔍 Chi tiết lỗi:\n{ex.Message}"
                    : message;

                Constants.ErrorLog($"❌ {title}: {message}", ex);

                MessageBox.Show(
                    fullMessage,
                    title,
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
            catch (Exception showEx)
            {
                // Fallback if MessageBox fails
                Constants.ErrorLog("❌ Lỗi khi hiển thị MessageBox", showEx);
                Console.WriteLine($"ERROR: {title} - {message}");
                if (ex != null)
                    Console.WriteLine($"EXCEPTION: {ex.Message}");
            }
        }

        /// <summary>
        /// Show warning MessageBox
        /// </summary>
        public static void ShowWarning(string title, string message)
        {
            try
            {
                Constants.DebugLog($"⚠️ {title}: {message}");

                MessageBox.Show(
                    message,
                    title,
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning
                );
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi hiển thị MessageBox cảnh báo", ex);
                Console.WriteLine($"WARNING: {title} - {message}");
            }
        }

        /// <summary>
        /// Show informational MessageBox
        /// </summary>
        public static void ShowInfo(string title, string message)
        {
            try
            {
                Constants.DebugLog($"ℹ️ {title}: {message}");

                MessageBox.Show(
                    message,
                    title,
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information
                );
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi hiển thị MessageBox thông tin", ex);
                Console.WriteLine($"INFO: {title} - {message}");
            }
        }

        /// <summary>
        /// Show confirmation dialog with Yes/No buttons
        /// </summary>
        /// <returns>True if user clicked Yes, False if No</returns>
        public static bool ShowConfirmation(string title, string message)
        {
            try
            {
                Constants.DebugLog($"❓ {title}: {message}");

                var result = MessageBox.Show(
                    message,
                    title,
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Question
                );

                return result == DialogResult.Yes;
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi hiển thị MessageBox xác nhận", ex);
                Console.WriteLine($"CONFIRM: {title} - {message}");
                return false;
            }
        }

        /// <summary>
        /// Show success notification (brief)
        /// </summary>
        public static void ShowSuccess(string title, string message)
        {
            try
            {
                Constants.DebugLog($"✅ {title}: {message}");

                MessageBox.Show(
                    message,
                    title,
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information  // Use Information icon for success
                );
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi hiển thị MessageBox thành công", ex);
                Console.WriteLine($"SUCCESS: {title} - {message}");
            }
        }
    }
}
