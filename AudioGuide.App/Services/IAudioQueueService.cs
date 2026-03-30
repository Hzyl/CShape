// File: AudioGuide.App/Services/IAudioQueueService.cs
using AudioGuide.App.Models;

namespace AudioGuide.App.Services
{
    /// <summary>
    /// Event args khi có thay đổi trong hàng đợi audio
    /// </summary>
    public class AudioQueueChangedEventArgs : EventArgs
    {
        public AudioContent? CurrentAudio { get; set; }
        public int QueueCount { get; set; }
    }

    /// <summary>
    /// Interface định nghĩa Audio Queue service
    /// Quản lý hàng đợi audio, xử lý cooldown 5 phút chống spam
    /// </summary>
    public interface IAudioQueueService
    {
        /// <summary>
        /// Thêm audio vào hàng đợi
        /// Kiểm tra cooldown: KHÔNG thêm nếu POI này đã phát < 5 phút
        /// </summary>
        /// <param name="audioContent">Nội dung audio cần thêm</param>
        /// <returns>True nếu thêm thành công, False nếu bị reject (cooldown)</returns>
        bool TryEnqueueAudio(AudioContent audioContent);

        /// <summary>
        /// Lấy audio hiện tại đang được phát (front of queue)
        /// </summary>
        /// <returns>Audio hiện tại, hoặc null nếu hàng đợi trống</returns>
        AudioContent? GetCurrentAudio();

        /// <summary>
        /// Lấy audio tiếp theo trong hàng đợi
        /// Gọi sau khi audio hiện tại phát xong
        /// </summary>
        /// <returns>Audio tiếp theo, hoặc null nếu hàng đợi trống</returns>
        AudioContent? GetNextAudio();

        /// <summary>
        /// Xóa audio hiện tại khỏi hàng đợi
        /// </summary>
        void RemoveCurrentAudio();

        /// <summary>
        /// Xóa tất cả audio khỏi hàng đợi
        /// </summary>
        void ClearQueue();

        /// <summary>
        /// Lấy số lượng audio trong hàng đợi
        /// </summary>
        int GetQueueCount();

        /// <summary>
        /// Kiểm tra xem POI có thể được thêm vào hàng đợi không
        /// (Kiểm tra coldown)
        /// </summary>
        /// <param name="poiId">ID của POI</param>
        /// <returns>True nếu có thể thêm, False nếu đang trong cooldown</returns>
        bool CanEnqueuePoi(Guid poiId);

        /// <summary>
        /// Lấy thời gian còn lại của cooldown cho một POI
        /// </summary>
        /// <param name="poiId">ID của POI</param>
        /// <returns>TimeSpan thời gian còn lại, hoặc TimeSpan.Zero nếu không có cooldown</returns>
        TimeSpan GetCooldownRemaining(Guid poiId);

        /// <summary>
        /// Lấy toàn bộ hàng đợi audio
        /// </summary>
        /// <returns>Danh sách các audio trong hàng đợi</returns>
        List<AudioContent> GetQueue();

        /// <summary>
        /// Event bắn khi hàng đợi thay đổi
        /// </summary>
        event EventHandler<AudioQueueChangedEventArgs>? OnQueueChanged;
    }
}
