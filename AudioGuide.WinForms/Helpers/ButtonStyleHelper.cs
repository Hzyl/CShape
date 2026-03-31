using System.Drawing;
using System.Windows.Forms;

namespace AudioGuide.WinForms.Helpers
{
    /// <summary>
    /// Helper class for applying consistent button styling across the application
    /// Uses WinForms native FlatStyle for modern appearance without external dependencies
    /// </summary>
    public static class ButtonStyleHelper
    {
        // Predefined color scheme
        public static class Colors
        {
            public static Color Primary = Color.FromArgb(52, 152, 219);      // Blue
            public static Color Success = Color.FromArgb(46, 204, 113);      // Green
            public static Color Danger = Color.FromArgb(231, 76, 60);        // Red
            public static Color Secondary = Color.FromArgb(149, 165, 166);   // Gray
        }

        /// <summary>
        /// Apply flat style with custom background color to a button
        /// </summary>
        public static void ApplyFlatStyle(Button button, Color backgroundColor, Color foregroundColor)
        {
            button.FlatStyle = FlatStyle.Flat;
            button.FlatAppearance.BorderSize = 0;
            button.FlatAppearance.MouseDownBackColor = DarkenColor(backgroundColor, 20);
            button.FlatAppearance.MouseOverBackColor = LightenColor(backgroundColor, 15);
            button.BackColor = backgroundColor;
            button.ForeColor = foregroundColor;
            button.Font = new Font(button.Font.FontFamily, button.Font.Size, FontStyle.Bold);
            button.Cursor = Cursors.Hand;
        }

        /// <summary>
        /// Apply primary style (Blue) - for main actions like Search, Play
        /// </summary>
        public static void ApplyPrimaryStyle(Button button)
        {
            ApplyFlatStyle(button, Colors.Primary, Color.White);
        }

        /// <summary>
        /// Apply success style (Green) - for OK, Confirm actions
        /// </summary>
        public static void ApplySuccessStyle(Button button)
        {
            ApplyFlatStyle(button, Colors.Success, Color.White);
        }

        /// <summary>
        /// Apply danger style (Red) - for Cancel, Close actions
        /// </summary>
        public static void ApplyDangerStyle(Button button)
        {
            ApplyFlatStyle(button, Colors.Danger, Color.White);
        }

        /// <summary>
        /// Apply secondary style (Gray) - for Refresh, Next actions
        /// </summary>
        public static void ApplySecondaryStyle(Button button)
        {
            ApplyFlatStyle(button, Colors.Secondary, Color.White);
        }

        /// <summary>
        /// Lighten a color by increasing brightness
        /// </summary>
        private static Color LightenColor(Color color, int amount)
        {
            return Color.FromArgb(
                Math.Min(255, color.R + amount),
                Math.Min(255, color.G + amount),
                Math.Min(255, color.B + amount)
            );
        }

        /// <summary>
        /// Darken a color by decreasing brightness
        /// </summary>
        private static Color DarkenColor(Color color, int amount)
        {
            return Color.FromArgb(
                Math.Max(0, color.R - amount),
                Math.Max(0, color.G - amount),
                Math.Max(0, color.B - amount)
            );
        }
    }
}
