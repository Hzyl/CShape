using System;
using System.Windows.Forms;

namespace WeatherApp
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.DefaultFont = new System.Drawing.Font("Arial", 9F);
            Application.Run(new Form1());
        }
    }
}
