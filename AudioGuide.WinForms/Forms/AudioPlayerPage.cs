using AudioGuide.WinForms.Services;
using AudioGuide.WinForms.Models;
using AudioGuide.WinForms.Helpers;

namespace AudioGuide.WinForms.Forms
{
    /// <summary>
    /// Audio Player Page - Phát nhạc từ hàng đợi
    /// </summary>
    public class AudioPlayerPage : UserControl
    {
        private readonly IAudioQueueService _audioQueueService;
        private readonly IAppLanguageService _languageService;

        private bool _isPlaying = false;
        private int _playbackSeconds = 0;
        private int _totalSeconds = 0;

        // UI Controls
        private Label _titleLabel = new();
        private Panel _playerPanel = new();
        private Label _poiNameLabel = new();
        private ProgressBar _progressBar = new();
        private Label _timeLabel = new();
        private Button _prevButton = new();
        private Button _playPauseButton = new();
        private Button _nextButton = new();
        private DataGridView _queueGrid = new();
        private Button _clearQueueButton = new();
        private Label _messageLabel = new();
        private System.Windows.Forms.Timer? _playbackTimer;

        public AudioPlayerPage(IAudioQueueService audioQueueService, IAppLanguageService languageService)
        {
            _audioQueueService = audioQueueService;
            _languageService = languageService;

            InitializeComponent();
            SetupControls();
            RefreshQueueDisplay();

            // Subscribe to queue changes
            _audioQueueService.OnQueueChanged += AudioQueueService_OnQueueChanged;

            Constants.DebugLog("🎵 AudioPlayerPage khởi tạo");
        }

        private void InitializeComponent()
        {
            Dock = DockStyle.Fill;
            AutoScroll = true;
        }

        private void SetupControls()
        {
            // Title
            _titleLabel.Text = "🎵 Phát Nhạc";
            _titleLabel.Font = new Font(Font.FontFamily, 14, FontStyle.Bold);
            _titleLabel.Dock = DockStyle.Top;
            _titleLabel.Height = 30;
            _titleLabel.Padding = new Padding(10);
            Controls.Add(_titleLabel);

            // Player Panel
            _playerPanel.Dock = DockStyle.Top;
            _playerPanel.Height = 200;
            _playerPanel.Padding = new Padding(10);
            _playerPanel.BorderStyle = BorderStyle.FixedSingle;

            // POI Name
            _poiNameLabel.Text = "Hàng đợi trống";
            _poiNameLabel.Font = new Font(Font.FontFamily, 12, FontStyle.Bold);
            _poiNameLabel.Location = new Point(10, 10);
            _poiNameLabel.Size = new Size(400, 30);
            _playerPanel.Controls.Add(_poiNameLabel);

            // Progress Bar
            _progressBar.Location = new Point(10, 50);
            _progressBar.Size = new Size(400, 20);
            _progressBar.Height = 20;
            _progressBar.Minimum = 0;
            _progressBar.Maximum = 100;
            _playerPanel.Controls.Add(_progressBar);

            // Time Label
            _timeLabel.Text = "0:00 / 0:00";
            _timeLabel.Location = new Point(10, 75);
            _timeLabel.Size = new Size(100, 20);
            _playerPanel.Controls.Add(_timeLabel);

            // Play/Pause Buttons
            _prevButton.Text = "⏮ Trước";
            _prevButton.Location = new Point(50, 110);
            _prevButton.Size = new Size(80, 35);
            _prevButton.Click += PrevButton_Click;
            _playerPanel.Controls.Add(_prevButton);

            _playPauseButton.Text = "▶ Phát";
            _playPauseButton.Location = new Point(150, 110);
            _playPauseButton.Size = new Size(100, 35);
            _playPauseButton.Font = new Font(Font.FontFamily, 10, FontStyle.Bold);
            _playPauseButton.Click += PlayPauseButton_Click;
            _playerPanel.Controls.Add(_playPauseButton);

            _nextButton.Text = "Tiếp ⏭";
            _nextButton.Location = new Point(270, 110);
            _nextButton.Size = new Size(80, 35);
            _nextButton.Click += NextButton_Click;
            _playerPanel.Controls.Add(_nextButton);

            _clearQueueButton.Text = "🗑️ Xóa Hàng Đợi";
            _clearQueueButton.Location = new Point(50, 155);
            _clearQueueButton.Size = new Size(120, 35);
            _clearQueueButton.Click += ClearQueueButton_Click;
            _playerPanel.Controls.Add(_clearQueueButton);

            Controls.Add(_playerPanel);

            // Queue Label
            var queueLabel = new Label
            {
                Text = "Hàng Đợi Audio",
                Font = new Font(Font.FontFamily, 11, FontStyle.Bold),
                Dock = DockStyle.Top,
                Height = 25,
                Padding = new Padding(10)
            };
            Controls.Add(queueLabel);

            // Queue Grid
            _queueGrid.Dock = DockStyle.Fill;
            _queueGrid.AutoGenerateColumns = true;
            _queueGrid.AllowUserToAddRows = false;
            _queueGrid.ReadOnly = true;
            _queueGrid.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
            Controls.Add(_queueGrid);

            // Message Label
            _messageLabel.Dock = DockStyle.Bottom;
            _messageLabel.Height = 25;
            _messageLabel.Padding = new Padding(10);
            _messageLabel.ForeColor = Color.Blue;
            Controls.Add(_messageLabel);

            // Setup playback timer
            _playbackTimer = new System.Windows.Forms.Timer();
            _playbackTimer.Interval = 1000; // 1 second
            _playbackTimer.Tick += PlaybackTimer_Tick;
        }

        private void PlayPauseButton_Click(object? sender, EventArgs e)
        {
            _isPlaying = !_isPlaying;
            _playPauseButton.Text = _isPlaying ? "⏸ Tạm Dừng" : "▶ Phát";

            if (_isPlaying)
            {
                _playbackTimer?.Start();
                _messageLabel.Text = "▶️ Đang phát";
            }
            else
            {
                _playbackTimer?.Stop();
                _messageLabel.Text = "⏸️ Tạm dừng";
            }
        }

        private void NextButton_Click(object? sender, EventArgs e)
        {
            _isPlaying = false;
            _playPauseButton.Text = "▶ Phát";
            _playbackTimer?.Stop();
            _playbackSeconds = 0;

            var nextAudio = _audioQueueService.GetNextAudio();
            RefreshQueueDisplay();
            _messageLabel.Text = nextAudio != null ? $"⏭️ Tiếp: {nextAudio.PoiName}" : "Hàng đợi trống";
        }

        private void PrevButton_Click(object? sender, EventArgs e)
        {
            _messageLabel.Text = "⏮️ Không thể quay lại (chỉ hỗ trợ FIFO queue)";
        }

        private void ClearQueueButton_Click(object? sender, EventArgs e)
        {
            _audioQueueService.ClearQueue();
            _isPlaying = false;
            _playPauseButton.Text = "▶ Phát";
            _playbackTimer?.Stop();
            RefreshQueueDisplay();
            _messageLabel.Text = "🗑️ Hàng đợi đã được xóa";
        }

        private void PlaybackTimer_Tick(object? sender, EventArgs e)
        {
            if (!_isPlaying || _totalSeconds == 0) return;

            _playbackSeconds++;
            UpdateProgressBar();

            if (_playbackSeconds >= _totalSeconds)
            {
                // Move to next
                NextButton_Click(null, EventArgs.Empty);
            }
        }

        private void UpdateProgressBar()
        {
            if (_totalSeconds > 0)
            {
                _progressBar.Value = (int)((_playbackSeconds / (double)_totalSeconds) * 100);
                var current = TimeSpan.FromSeconds(_playbackSeconds);
                var total = TimeSpan.FromSeconds(_totalSeconds);
                _timeLabel.Text = $"{current.Minutes}:{current.Seconds:D2} / {total.Minutes}:{total.Seconds:D2}";
            }
        }

        private void RefreshQueueDisplay()
        {
            var currentAudio = _audioQueueService.GetCurrentAudio();
            if (currentAudio != null)
            {
                _poiNameLabel.Text = currentAudio.PoiName;
                _totalSeconds = currentAudio.DurationInSeconds ?? 0;
                _playbackSeconds = 0;
                UpdateProgressBar();
            }
            else
            {
                _poiNameLabel.Text = "Hàng đợi trống";
                _totalSeconds = 0;
                _playbackSeconds = 0;
                _progressBar.Value = 0;
                _timeLabel.Text = "0:00 / 0:00";
            }

            var queue = _audioQueueService.GetQueue();
            _queueGrid.DataSource = queue;
        }

        private void AudioQueueService_OnQueueChanged(object? sender, AudioGuide.WinForms.Helpers.AudioQueueChangedEventArgs e)
        {
            if (InvokeRequired)
            {
                Invoke(() => RefreshQueueDisplay());
            }
            else
            {
                RefreshQueueDisplay();
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _playbackTimer?.Dispose();
                _audioQueueService.OnQueueChanged -= AudioQueueService_OnQueueChanged;
            }
            base.Dispose(disposing);
        }
    }
}
