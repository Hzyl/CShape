using System;
using System.Drawing;
using System.Net.Http;
using System.Windows.Forms;

namespace WeatherApp
{
    public partial class Form1 : Form
    {
        private ApiService apiService;
        private HistoryService historyService;

        public Form1()
        {
            InitializeComponent();
            apiService = new ApiService();
            historyService = new HistoryService();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            this.Text = "Ứng Dụng Tra Cứu Thời Tiết";
            this.Width = 700;
            this.Height = 600;
            this.StartPosition = FormStartPosition.CenterScreen;

            LoadHistory();
        }

        /// <summary>
        /// Load lịch sử từ file vào ListBox
        /// </summary>
        private void LoadHistory()
        {
            lstHistory.Items.Clear();
            foreach (var city in historyService.GetHistory())
            {
                lstHistory.Items.Add(city);
            }
        }

        /// <summary>
        /// Sự kiện nhấn nút Search hoặc nhấn Enter trong TextBox
        /// </summary>
        private async void btnSearch_Click(object sender, EventArgs e)
        {
            await SearchWeather();
        }

        private async void txtCity_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Return)
            {
                await SearchWeather();
            }
        }

        /// <summary>
        /// Tìm kiếm thời tiết
        /// </summary>
        private async System.Threading.Tasks.Task SearchWeather()
        {
            string cityName = txtCity.Text.Trim();

            if (string.IsNullOrEmpty(cityName))
            {
                MessageBox.Show("Vui lòng nhập tên thành phố!", "Thông báo", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            btnSearch.Enabled = false;
            btnSearch.Text = "Đang tìm...";
            lblStatus.Text = "Đang lấy dữ liệu...";

            try
            {
                // Gọi API
                WeatherData weather = await apiService.GetWeatherByCityAsync(cityName);

                // Hiển thị dữ liệu
                DisplayWeather(weather);

                // Thêm vào lịch sử
                historyService.AddCity(weather.City);
                LoadHistory();

                lblStatus.Text = "Thành công!";
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi: {ex.Message}", "Lỗi", MessageBoxButtons.OK, MessageBoxIcon.Error);
                lblStatus.Text = "Lỗi khi lấy dữ liệu";
            }
            finally
            {
                btnSearch.Enabled = true;
                btnSearch.Text = "Search";
            }
        }

        /// <summary>
        /// Hiển thị thông tin thời tiết lên form
        /// </summary>
        private async void DisplayWeather(WeatherData weather)
        {
            lblCityName.Text = $"Thành phố: {weather.City}";
            lblTemperature.Text = $"Nhiệt độ: {weather.Temperature}°C";
            lblHumidity.Text = $"Độ ẩm: {weather.Humidity}%";
            lblWind.Text = $"Tốc độ gió: {weather.WindSpeed} m/s";
            lblWeatherStatus.Text = $"Trạng thái: {weather.Description}";

            // Tải và hiển thị icon thời tiết
            try
            {
                string iconUrl = apiService.GetWeatherIconUrl(weather.Icon);
                using (HttpClient client = new HttpClient())
                {
                    byte[] imageData = await client.GetByteArrayAsync(iconUrl);
                    using (var ms = new System.IO.MemoryStream(imageData))
                    {
                        picWeather.Image = Image.FromStream(ms);
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Không thể tải icon: {ex.Message}");
            }

            txtCity.Clear();
        }

        /// <summary>
        /// Sự kiện khi click vào một thành phố trong ListBox
        /// </summary>
        private async void lstHistory_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (lstHistory.SelectedIndex >= 0)
            {
                string selectedCity = lstHistory.SelectedItem.ToString();
                txtCity.Text = selectedCity;
                await SearchWeather();
            }
        }

        /// <summary>
        /// Sự kiện xóa lịch sử
        /// </summary>
        private void btnClearHistory_Click(object sender, EventArgs e)
        {
            DialogResult result = MessageBox.Show("Bạn có chắc chắn muốn xóa toàn bộ lịch sử?",
                "Xác nhận", MessageBoxButtons.YesNo, MessageBoxIcon.Question);

            if (result == DialogResult.Yes)
            {
                historyService.ClearHistory();
                LoadHistory();
                ClearWeatherDisplay();
                MessageBox.Show("Lịch sử đã được xóa!", "Thông báo", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }

        /// <summary>
        /// Xóa hiển thị thời tiết
        /// </summary>
        private void ClearWeatherDisplay()
        {
            lblCityName.Text = "Thành phố: ";
            lblTemperature.Text = "Nhiệt độ: ";
            lblHumidity.Text = "Độ ẩm: ";
            lblWind.Text = "Tốc độ gió: ";
            lblWeatherStatus.Text = "Trạng thái: ";
            picWeather.Image = null;
            lblStatus.Text = "";
        }
    }
}
