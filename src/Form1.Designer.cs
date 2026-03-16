namespace WeatherApp
{
    partial class Form1
    {
        private System.ComponentModel.IContainer components = null;

        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Form1));

            // Label Tiêu đề
            lblTitle = new System.Windows.Forms.Label();
            lblTitle.AutoSize = true;
            lblTitle.Font = new System.Drawing.Font("Arial", 18F, System.Drawing.FontStyle.Bold);
            lblTitle.Location = new System.Drawing.Point(150, 20);
            lblTitle.Name = "lblTitle";
            lblTitle.Size = new System.Drawing.Size(400, 35);
            lblTitle.TabIndex = 0;
            lblTitle.Text = "ỨNG DỤNG TRA CỨU THỜI TIẾT";

            // Label "Tên thành phố"
            lblCityLabel = new System.Windows.Forms.Label();
            lblCityLabel.AutoSize = true;
            lblCityLabel.Font = new System.Drawing.Font("Arial", 10F);
            lblCityLabel.Location = new System.Drawing.Point(20, 70);
            lblCityLabel.Name = "lblCityLabel";
            lblCityLabel.Size = new System.Drawing.Size(120, 18);
            lblCityLabel.TabIndex = 1;
            lblCityLabel.Text = "Nhập tên thành phố:";

            // TextBox nhập thành phố
            txtCity = new System.Windows.Forms.TextBox();
            txtCity.Font = new System.Drawing.Font("Arial", 10F);
            txtCity.Location = new System.Drawing.Point(20, 95);
            txtCity.Name = "txtCity";
            txtCity.Size = new System.Drawing.Size(400, 25);
            txtCity.TabIndex = 2;
            txtCity.KeyDown += new System.Windows.Forms.KeyEventHandler(this.txtCity_KeyDown);

            // Button tìm kiếm
            btnSearch = new System.Windows.Forms.Button();
            btnSearch.Font = new System.Drawing.Font("Arial", 10F);
            btnSearch.Location = new System.Drawing.Point(430, 95);
            btnSearch.Name = "btnSearch";
            btnSearch.Size = new System.Drawing.Size(100, 30);
            btnSearch.TabIndex = 3;
            btnSearch.Text = "Search";
            btnSearch.UseVisualStyleBackColor = true;
            btnSearch.Click += new System.EventHandler(this.btnSearch_Click);

            // Label hiển thị tên thành phố
            lblCityName = new System.Windows.Forms.Label();
            lblCityName.AutoSize = true;
            lblCityName.Font = new System.Drawing.Font("Arial", 12F, System.Drawing.FontStyle.Bold);
            lblCityName.Location = new System.Drawing.Point(20, 140);
            lblCityName.Name = "lblCityName";
            lblCityName.Size = new System.Drawing.Size(100, 20);
            lblCityName.TabIndex = 4;
            lblCityName.Text = "Thành phố: ";

            // Label nhiệt độ
            lblTemperature = new System.Windows.Forms.Label();
            lblTemperature.AutoSize = true;
            lblTemperature.Font = new System.Drawing.Font("Arial", 10F);
            lblTemperature.Location = new System.Drawing.Point(20, 170);
            lblTemperature.Name = "lblTemperature";
            lblTemperature.Size = new System.Drawing.Size(100, 18);
            lblTemperature.TabIndex = 5;
            lblTemperature.Text = "Nhiệt độ: ";

            // Label độ ẩm
            lblHumidity = new System.Windows.Forms.Label();
            lblHumidity.AutoSize = true;
            lblHumidity.Font = new System.Drawing.Font("Arial", 10F);
            lblHumidity.Location = new System.Drawing.Point(20, 195);
            lblHumidity.Name = "lblHumidity";
            lblHumidity.Size = new System.Drawing.Size(100, 18);
            lblHumidity.TabIndex = 6;
            lblHumidity.Text = "Độ ẩm: ";

            // Label tốc độ gió
            lblWind = new System.Windows.Forms.Label();
            lblWind.AutoSize = true;
            lblWind.Font = new System.Drawing.Font("Arial", 10F);
            lblWind.Location = new System.Drawing.Point(20, 220);
            lblWind.Name = "lblWind";
            lblWind.Size = new System.Drawing.Size(100, 18);
            lblWind.TabIndex = 7;
            lblWind.Text = "Tốc độ gió: ";

            // Label trạng thái thời tiết
            lblWeatherStatus = new System.Windows.Forms.Label();
            lblWeatherStatus.AutoSize = true;
            lblWeatherStatus.Font = new System.Drawing.Font("Arial", 10F);
            lblWeatherStatus.Location = new System.Drawing.Point(20, 245);
            lblWeatherStatus.Name = "lblWeatherStatus";
            lblWeatherStatus.Size = new System.Drawing.Size(100, 18);
            lblWeatherStatus.TabIndex = 8;
            lblWeatherStatus.Text = "Trạng thái: ";

            // PictureBox hiển thị icon
            picWeather = new System.Windows.Forms.PictureBox();
            picWeather.Location = new System.Drawing.Point(350, 140);
            picWeather.Name = "picWeather";
            picWeather.Size = new System.Drawing.Size(150, 150);
            picWeather.SizeMode = System.Windows.Forms.PictureBoxSizeMode.StretchImage;
            picWeather.TabIndex = 9;
            picWeather.TabStop = false;

            // Label "Lịch sử tìm kiếm"
            lblHistoryLabel = new System.Windows.Forms.Label();
            lblHistoryLabel.AutoSize = true;
            lblHistoryLabel.Font = new System.Drawing.Font("Arial", 10F, System.Drawing.FontStyle.Bold);
            lblHistoryLabel.Location = new System.Drawing.Point(20, 300);
            lblHistoryLabel.Name = "lblHistoryLabel";
            lblHistoryLabel.Size = new System.Drawing.Size(120, 18);
            lblHistoryLabel.TabIndex = 10;
            lblHistoryLabel.Text = "Lịch sử tìm kiếm:";

            // ListBox hiển thị lịch sử
            lstHistory = new System.Windows.Forms.ListBox();
            lstHistory.Font = new System.Drawing.Font("Arial", 9F);
            lstHistory.FormattingEnabled = true;
            lstHistory.Location = new System.Drawing.Point(20, 325);
            lstHistory.Name = "lstHistory";
            lstHistory.Size = new System.Drawing.Size(510, 100);
            lstHistory.TabIndex = 11;
            lstHistory.SelectedIndexChanged += new System.EventHandler(this.lstHistory_SelectedIndexChanged);

            // Button xóa lịch sử
            btnClearHistory = new System.Windows.Forms.Button();
            btnClearHistory.Font = new System.Drawing.Font("Arial", 10F);
            btnClearHistory.Location = new System.Drawing.Point(20, 440);
            btnClearHistory.Name = "btnClearHistory";
            btnClearHistory.Size = new System.Drawing.Size(150, 30);
            btnClearHistory.TabIndex = 12;
            btnClearHistory.Text = "Clear History";
            btnClearHistory.UseVisualStyleBackColor = true;
            btnClearHistory.Click += new System.EventHandler(this.btnClearHistory_Click);

            // Label trạng thái
            lblStatus = new System.Windows.Forms.Label();
            lblStatus.AutoSize = true;
            lblStatus.Font = new System.Drawing.Font("Arial", 9F, System.Drawing.FontStyle.Italic);
            lblStatus.ForeColor = System.Drawing.Color.Gray;
            lblStatus.Location = new System.Drawing.Point(20, 480);
            lblStatus.Name = "lblStatus";
            lblStatus.Size = new System.Drawing.Size(0, 16);
            lblStatus.TabIndex = 13;

            // Form1
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.SystemColors.Control;
            this.ClientSize = new System.Drawing.Size(550, 510);
            this.Controls.Add(lblStatus);
            this.Controls.Add(btnClearHistory);
            this.Controls.Add(lstHistory);
            this.Controls.Add(lblHistoryLabel);
            this.Controls.Add(picWeather);
            this.Controls.Add(lblWeatherStatus);
            this.Controls.Add(lblWind);
            this.Controls.Add(lblHumidity);
            this.Controls.Add(lblTemperature);
            this.Controls.Add(lblCityName);
            this.Controls.Add(btnSearch);
            this.Controls.Add(txtCity);
            this.Controls.Add(lblCityLabel);
            this.Controls.Add(lblTitle);
            this.Name = "Form1";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Ứng Dụng Tra Cứu Thời Tiết";
            this.Load += new System.EventHandler(this.Form1_Load);
            ((System.ComponentModel.ISupportInitialize)(picWeather)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();
        }

        private System.Windows.Forms.Label lblTitle;
        private System.Windows.Forms.Label lblCityLabel;
        private System.Windows.Forms.TextBox txtCity;
        private System.Windows.Forms.Button btnSearch;
        private System.Windows.Forms.Label lblCityName;
        private System.Windows.Forms.Label lblTemperature;
        private System.Windows.Forms.Label lblHumidity;
        private System.Windows.Forms.Label lblWind;
        private System.Windows.Forms.Label lblWeatherStatus;
        private System.Windows.Forms.PictureBox picWeather;
        private System.Windows.Forms.Label lblHistoryLabel;
        private System.Windows.Forms.ListBox lstHistory;
        private System.Windows.Forms.Button btnClearHistory;
        private System.Windows.Forms.Label lblStatus;
    }
}
