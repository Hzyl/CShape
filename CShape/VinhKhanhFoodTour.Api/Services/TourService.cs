using MongoDB.Driver;
using VinhKhanhFoodTour.Api.Models;

namespace VinhKhanhFoodTour.Api.Services
{
    public class TourService
    {
        private readonly IMongoCollection<Tour> _tours;

        public TourService(IMongoDatabase database)
        {
            _tours = database.GetCollection<Tour>("tours");
        }

        public async Task<List<Tour>> GetAllAsync() =>
            await _tours.Find(_ => true).ToListAsync();

        public async Task<Tour?> GetByIdAsync(string id) =>
            await _tours.Find(t => t.Id == id).FirstOrDefaultAsync();

        public async Task<Tour> CreateAsync(Tour tour)
        {
            tour.CreatedAt = DateTime.UtcNow;
            await _tours.InsertOneAsync(tour);
            return tour;
        }

        public async Task<bool> UpdateAsync(string id, Tour tour)
        {
            var result = await _tours.ReplaceOneAsync(t => t.Id == id, tour);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _tours.DeleteOneAsync(t => t.Id == id);
            return result.DeletedCount > 0;
        }

        /// <summary>Seed tour mẫu</summary>
        public async Task SeedDataAsync(List<string> poiIds)
        {
            var count = await _tours.CountDocumentsAsync(_ => true);
            if (count > 0) return;

            var tour = new Tour
            {
                Name = new Dictionary<string, string>
                {
                    { "vi", "Tour Ẩm Thực Vĩnh Khánh - Trọn Vẹn" },
                    { "en", "Vinh Khanh Food Tour - Complete" },
                    { "ja", "ヴィンカイン美食ツアー - 完全版" },
                    { "zh", "永庆美食之旅 - 完整版" }
                },
                Description = new Dictionary<string, string>
                {
                    { "vi", "Khám phá trọn vẹn phố ẩm thực Vĩnh Khánh từ cầu Nguyễn Văn Cừ đến chợ Xóm Chiếu. Thưởng thức 8 điểm ẩm thực đặc sắc nhất." },
                    { "en", "Explore the complete Vinh Khanh food street from Nguyen Van Cu bridge to Xom Chieu market. Enjoy 8 unique culinary spots." },
                    { "ja", "グエンヴァンクー橋からソムチエウ市場まで、ヴィンカイン美食通りを完全に探索。8つのユニークなグルメスポットをお楽しみください。" },
                    { "zh", "从阮文举桥到芹蕉市场，完整探索永庆美食街。享受8个独特的美食景点。" }
                },
                PoiIds = poiIds,
                EstimatedDuration = 90,
                EstimatedDistance = 1.2,
                IsActive = true
            };

            await _tours.InsertOneAsync(tour);
        }
    }
}
