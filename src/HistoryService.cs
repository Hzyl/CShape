using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace WeatherApp
{
    /// <summary>
    /// Service quản lí lịch sử tìm kiếm
    /// </summary>
    public class HistoryService
    {
        private readonly string historyFilePath;
        private List<string> history;

        public HistoryService(string filePath = "history.txt")
        {
            historyFilePath = filePath;
            history = new List<string>();
            LoadHistory();
        }

        /// <summary>
        /// Tải lịch sử từ file
        /// </summary>
        public void LoadHistory()
        {
            try
            {
                if (File.Exists(historyFilePath))
                {
                    history = File.ReadAllLines(historyFilePath)
                        .Where(line => !string.IsNullOrWhiteSpace(line))
                        .ToList();
                }
                else
                {
                    history = new List<string>();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi tải lịch sử: {ex.Message}");
                history = new List<string>();
            }
        }

        /// <summary>
        /// Thêm thành phố vào lịch sử
        /// </summary>
        public void AddCity(string cityName)
        {
            if (string.IsNullOrWhiteSpace(cityName))
                return;

            // Nếu thành phố đã tồn tại, xóa nó đi rồi thêm lại (để nó ở đầu)
            if (history.Contains(cityName, StringComparer.OrdinalIgnoreCase))
            {
                history.RemoveAll(c => c.Equals(cityName, StringComparison.OrdinalIgnoreCase));
            }

            // Thêm thành phố vào đầu danh sách
            history.Insert(0, cityName);

            // Giới hạn lịch sử tối đa 20 thành phố
            if (history.Count > 20)
            {
                history = history.Take(20).ToList();
            }

            SaveHistory();
        }

        /// <summary>
        /// Lưu lịch sử vào file
        /// </summary>
        public void SaveHistory()
        {
            try
            {
                File.WriteAllLines(historyFilePath, history);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi lưu lịch sử: {ex.Message}");
            }
        }

        /// <summary>
        /// Xóa toàn bộ lịch sử
        /// </summary>
        public void ClearHistory()
        {
            history.Clear();
            try
            {
                if (File.Exists(historyFilePath))
                {
                    File.Delete(historyFilePath);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi xóa lịch sử: {ex.Message}");
            }
        }

        /// <summary>
        /// Lấy danh sách lịch sử
        /// </summary>
        public List<string> GetHistory()
        {
            return new List<string>(history);
        }

        /// <summary>
        /// Lấy số lượng thành phố trong lịch sử
        /// </summary>
        public int GetCount()
        {
            return history.Count;
        }
    }
}
