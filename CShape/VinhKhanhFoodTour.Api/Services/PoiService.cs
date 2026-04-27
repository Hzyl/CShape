using MongoDB.Driver;
using VinhKhanhFoodTour.Api.Models;

namespace VinhKhanhFoodTour.Api.Services
{
    public class PoiService
    {
        private readonly IMongoCollection<Poi> _pois;

        public PoiService(IMongoDatabase database)
        {
            _pois = database.GetCollection<Poi>("pois");
        }

        public async Task<List<Poi>> GetAllAsync() =>
            await _pois.Find(_ => true).SortBy(p => p.Priority).ToListAsync();

        public async Task<List<Poi>> GetActiveAsync() =>
            await _pois.Find(p => p.IsActive).SortBy(p => p.Priority).ToListAsync();

        public async Task<Poi?> GetByIdAsync(string id) =>
            await _pois.Find(p => p.Id == id).FirstOrDefaultAsync();

        public async Task<Poi?> GetByQrCodeAsync(string qrCode) =>
            await _pois.Find(p => p.QrCode == qrCode).FirstOrDefaultAsync();

        public async Task<Poi> CreateAsync(Poi poi)
        {
            poi.CreatedAt = DateTime.UtcNow;
            poi.UpdatedAt = DateTime.UtcNow;
            await _pois.InsertOneAsync(poi);
            return poi;
        }

        public async Task<bool> UpdateAsync(string id, Poi poi)
        {
            poi.UpdatedAt = DateTime.UtcNow;
            var result = await _pois.ReplaceOneAsync(p => p.Id == id, poi);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _pois.DeleteOneAsync(p => p.Id == id);
            return result.DeletedCount > 0;
        }

        /// <summary>
        /// Seed dữ liệu mẫu nếu collection rỗng
        /// </summary>
        public async Task SeedDataAsync()
        {
            var count = await _pois.CountDocumentsAsync(_ => true);
            if (count > 0) return;

            var pois = new List<Poi>
            {
                new Poi
                {
                    Name = new Dictionary<string, string>
                    {
                        { "vi", "Ốc Đào Vĩnh Khánh" },
                        { "en", "Oc Dao Vinh Khanh" },
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán ốc nổi tiếng nhất phố Vĩnh Khánh, chuyên các món ốc hấp, ốc xào, ốc nướng với hương vị đậm đà. Quán đã hoạt động hơn 20 năm và là điểm đến không thể bỏ qua." },
                        { "en", "The most famous snail restaurant on Vinh Khanh Street, specializing in steamed, stir-fried, and grilled snails with rich flavors. Operating for over 20 years." },
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Xin chào! Bạn đang đến gần Ốc Đào Vĩnh Khánh, quán ốc nổi tiếng nhất con phố này. Được thành lập hơn 20 năm trước, đây là nơi bạn có thể thưởng thức các món ốc hấp sả, ốc xào bơ tỏi, và ốc nướng mỡ hành tuyệt vời. Giá trung bình từ 50 đến 150 nghìn đồng một món." },
                        { "en", "Welcome! You are approaching Oc Dao Vinh Khanh, the most famous snail restaurant on this street. Established over 20 years ago, this is where you can enjoy amazing steamed lemongrass snails, garlic butter stir-fried snails, and grilled snails with scallion oil. Average price is 2 to 6 dollars per dish." },
                    },
                    Latitude = 10.7572,
                    Longitude = 106.6953,
                    Radius = 40,
                    Priority = 1,
                    Category = "seafood",
                    Address = "50 Vĩnh Khánh, Phường 1, Quận 4",
                    OpeningHours = "15:00 - 23:00",
                    PriceRange = "50.000 - 200.000 VNĐ",
                    QrCode = "VK-POI-001",
                    ImageUrl = "/images/oc-dao.jpg"
                },
                new Poi
                {
                    Name = new Dictionary<string, string>
                    {
                        { "vi", "Hải Sản Năm Đảnh" },
                        { "en", "Nam Danh Seafood" },
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán hải sản tươi sống với tôm, cua, ghẹ, mực được đánh bắt hàng ngày. Nổi tiếng với lẩu hải sản và cua rang me." },
                        { "en", "Fresh seafood restaurant with daily caught shrimp, crab, and squid. Famous for seafood hotpot and tamarind crab." },
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Bạn đang đến Hải Sản Năm Đảnh! Đây là quán hải sản tươi sống nổi tiếng trên phố Vĩnh Khánh. Hải sản được đánh bắt hàng ngày, đảm bảo tươi ngon. Món đặc biệt là lẩu hải sản chua cay và cua rang me. Giá rất hợp lý so với chất lượng." },
                        { "en", "You are approaching Nam Danh Seafood! This famous seafood restaurant on Vinh Khanh Street serves daily fresh-caught seafood. Their specialties include spicy sour seafood hotpot and tamarind crab. Great value for the quality." },
                    },
                    Latitude = 10.7568,
                    Longitude = 106.6950,
                    Radius = 35,
                    Priority = 2,
                    Category = "seafood",
                    Address = "84 Vĩnh Khánh, Phường 1, Quận 4",
                    OpeningHours = "16:00 - 23:30",
                    PriceRange = "80.000 - 350.000 VNĐ",
                    QrCode = "VK-POI-002",
                    ImageUrl = "/images/hai-san.jpg"
                },
                new Poi
                {
                    Name = new Dictionary<string, string>
                    {
                        { "vi", "Lẩu Dê Vĩnh Khánh" },
                        { "en", "Vinh Khanh Goat Hotpot" },
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán lẩu dê truyền thống với nhiều món từ dê: lẩu dê, dê nướng, dê xào lăn. Thịt dê tươi, không hôi, rất mềm." },
                        { "en", "Traditional goat hotpot restaurant with various goat dishes: hotpot, grilled, and stir-fried. Fresh, tender goat meat without any gamey smell." },
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Chào mừng bạn đến với Lẩu Dê Vĩnh Khánh! Đây là một trong những quán lẩu dê ngon nhất Sài Gòn. Thịt dê được chọn lọc kỹ càng, tươi ngon và không có mùi hôi. Bạn nên thử lẩu dê nấm và dê nướng tảng. Quán mở từ 4 giờ chiều." },
                        { "en", "Welcome to Vinh Khanh Goat Hotpot! This is one of the best goat hotpot restaurants in Saigon. The goat meat is carefully selected, fresh and without any gamey smell. Try their mushroom goat hotpot and grilled goat. Opens at 4pm." },
                    },
                    Latitude = 10.7565,
                    Longitude = 106.6948,
                    Radius = 35,
                    Priority = 3,
                    Category = "hotpot",
                    Address = "106 Vĩnh Khánh, Phường 1, Quận 4",
                    OpeningHours = "16:00 - 23:00",
                    PriceRange = "100.000 - 300.000 VNĐ",
                    QrCode = "VK-POI-003",
                    ImageUrl = "/images/lau-de.jpg"
                },
                new Poi
                {
                    Name = new Dictionary<string, string>
                    {
                        { "vi", "Cơm Tấm Vĩnh Khánh" },
                        { "en", "Vinh Khanh Broken Rice" },
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán cơm tấm bình dân với sườn nướng than hoa, bì, chả, trứng ốp la. Phục vụ từ sáng sớm đến tối." },
                        { "en", "Affordable broken rice with charcoal-grilled pork chop, shredded pork skin, meatloaf, and fried egg. Served from early morning to night." },
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Bạn đang ở gần Cơm Tấm Vĩnh Khánh! Đây là quán cơm tấm bình dân nhưng cực kỳ ngon. Sườn được nướng trên than hoa nóng, thơm phức, kèm với bì, chả, trứng ốp la và nước mắm chua ngọt. Một dĩa cơm chỉ từ 35 nghìn đồng, phục vụ cả ngày." },
                        { "en", "You are near Vinh Khanh Broken Rice! This is a humble but incredibly delicious broken rice shop. The pork chop is grilled over hot charcoal, served with shredded pork skin, meatloaf, fried egg, and sweet fish sauce. A plate costs only about 1.5 dollars." },
                    },
                    Latitude = 10.7560,
                    Longitude = 106.6945,
                    Radius = 30,
                    Priority = 4,
                    Category = "street_food",
                    Address = "130 Vĩnh Khánh, Phường 1, Quận 4",
                    OpeningHours = "06:00 - 22:00",
                    PriceRange = "35.000 - 65.000 VNĐ",
                    QrCode = "VK-POI-004",
                    ImageUrl = "/images/com-tam.jpg"
                },
                new Poi
                {
                    Name = new Dictionary<string, string>
                    {
                        { "vi", "Bánh Tráng Trộn Cô Tư" },
                        { "en", "Aunt Tu's Mixed Rice Paper" },
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Xe bánh tráng trộn nổi tiếng với đầy đủ topping: trứng cút, khô bò, mắm ruốc, rau răm. Món ăn vặt đường phố đặc trưng Sài Gòn." },
                        { "en", "Famous mixed rice paper cart with full toppings: quail eggs, beef jerky, shrimp paste, and herbs. An iconic Saigon street snack." },
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Đây là xe Bánh Tráng Trộn Cô Tư nổi tiếng! Bánh tráng trộn là món ăn vặt đường phố đặc trưng của Sài Gòn. Bánh tráng được cắt nhỏ, trộn với trứng cút, khô bò, mắm ruốc, rau răm, đậu phộng rang. Vị chua cay mặn ngọt hài hòa. Chỉ 20 nghìn một bịch." },
                        { "en", "This is the famous Aunt Tu's Mixed Rice Paper! Mixed rice paper is an iconic Saigon street snack. Rice paper is cut into strips and mixed with quail eggs, beef jerky, shrimp paste, Vietnamese herbs, and roasted peanuts. A perfect harmony of sour, spicy, salty and sweet flavors." },
                    },
                    Latitude = 10.7558,
                    Longitude = 106.6943,
                    Radius = 25,
                    Priority = 5,
                    Category = "snack",
                    Address = "148 Vĩnh Khánh, Phường 1, Quận 4",
                    OpeningHours = "14:00 - 22:00",
                    PriceRange = "15.000 - 30.000 VNĐ",
                    QrCode = "VK-POI-005",
                    ImageUrl = "/images/banh-trang.jpg"
                },
                new Poi
                {
                    Name = new Dictionary<string, string>
                    {
                        { "vi", "Bún Mắm Cô Ba" },
                        { "en", "Aunt Ba's Fermented Fish Noodle" },
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Bún mắm miền Tây với nước lèo đậm đà từ mắm cá linh, hải sản tươi, rau sống. Hương vị truyền thống Nam Bộ." },
                        { "en", "Southern Vietnamese fermented fish noodle soup with rich broth, fresh seafood, and herbs. Authentic Mekong Delta flavors." },
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Bún Mắm Cô Ba là quán bún mắm ngon nổi tiếng! Nước lèo được nấu từ mắm cá linh miền Tây, đậm đà thơm ngon. Trong tô bún có tôm, mực, cá, thịt heo quay và rau sống tươi xanh. Đây là hương vị đặc trưng miền Tây Nam Bộ giữa lòng Sài Gòn." },
                        { "en", "Aunt Ba's Fermented Fish Noodle is a famous noodle shop! The broth is made from Mekong Delta fermented fish, rich and aromatic. Each bowl contains shrimp, squid, fish, roasted pork, and fresh herbs. This is authentic Southern Vietnamese flavor in the heart of Saigon." },
                    },
                    Latitude = 10.7555,
                    Longitude = 106.6941,
                    Radius = 30,
                    Priority = 4,
                    Category = "street_food",
                    Address = "166 Vĩnh Khánh, Phường 1, Quận 4",
                    OpeningHours = "07:00 - 21:00",
                    PriceRange = "45.000 - 80.000 VNĐ",
                    QrCode = "VK-POI-006",
                    ImageUrl = "/images/bun-mam.jpg"
                },
                new Poi
                {
                    Name = new Dictionary<string, string>
                    {
                        { "vi", "Cua Rang Me Quận 4" },
                        { "en", "District 4 Tamarind Crab" },
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán chuyên cua rang me, cua sốt trứng muối, cua lột chiên giòn. Cua tươi sống được chế biến tại bàn." },
                        { "en", "Specializing in tamarind crab, salted egg crab, and crispy soft-shell crab. Live crabs prepared at your table." },
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Đến Cua Rang Me Quận 4! Đây là thiên đường dành cho người yêu cua. Cua được chọn tươi sống, rang với nước me chua ngọt thấm đều. Ngoài ra còn có cua sốt trứng muối béo ngậy và cua lột chiên giòn tan. Nhớ kêu thêm bánh mì chấm nước sốt nhé!" },
                        { "en", "Welcome to District 4 Tamarind Crab! This is paradise for crab lovers. Fresh live crabs are wok-fried with sweet and sour tamarind sauce. Also try the creamy salted egg crab and crispy soft-shell crab. Don't forget to order bread to dip in the sauce!" },
                    },
                    Latitude = 10.7562,
                    Longitude = 106.6946,
                    Radius = 35,
                    Priority = 2,
                    Category = "seafood",
                    Address = "118 Vĩnh Khánh, Phường 1, Quận 4",
                    OpeningHours = "15:30 - 23:00",
                    PriceRange = "120.000 - 400.000 VNĐ",
                    QrCode = "VK-POI-007",
                    ImageUrl = "/images/cua-rang-me.jpg"
                },
                new Poi
                {
                    Name = new Dictionary<string, string>
                    {
                        { "vi", "Chợ Xóm Chiếu" },
                        { "en", "Xom Chieu Market" },
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Chợ truyền thống lâu đời nhất Quận 4, nơi cung cấp nguyên liệu tươi sống cho toàn bộ phố ẩm thực. Có nhiều quán ăn ngon bên trong chợ." },
                        { "en", "The oldest traditional market in District 4, supplying fresh ingredients for the entire food street. Many delicious food stalls inside." },
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Bạn đang ở gần Chợ Xóm Chiếu, ngôi chợ truyền thống lâu đời nhất Quận 4! Chợ là nguồn cung cấp nguyên liệu tươi sống cho toàn bộ phố ẩm thực Vĩnh Khánh. Bên trong chợ có nhiều quán ăn bình dân ngon và rẻ. Đây cũng là nơi người dân địa phương sinh hoạt hàng ngày, mang đậm nét văn hóa Sài Gòn." },
                        { "en", "You are near Xom Chieu Market, the oldest traditional market in District 4! This market supplies fresh ingredients for the entire Vinh Khanh food street. Inside, you'll find many affordable and delicious food stalls. This is also where locals do their daily shopping, showing authentic Saigon culture." },
                    },
                    Latitude = 10.7578,
                    Longitude = 106.6960,
                    Radius = 60,
                    Priority = 3,
                    Category = "landmark",
                    Address = "Chợ Xóm Chiếu, Quận 4",
                    OpeningHours = "05:00 - 18:00",
                    PriceRange = "20.000 - 50.000 VNĐ",
                    QrCode = "VK-POI-008",
                    ImageUrl = "/images/cho-xom-chieu.jpg"
                },
                new Poi
                {
                    Name = new Dictionary<string, string>
                    {
                        { "vi", "Điểm Dừng Xe Buýt Khánh Hội" },
                        { "en", "Khanh Hoi Bus Stop" },
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Điểm dừng xe buýt chính gần phố ẩm thực. Có QR Code để quét và bắt đầu tour thuyết minh ngay khi xuống xe." },
                        { "en", "Main bus stop near the food street. QR Code available to scan and start the audio tour right after getting off the bus." },
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Chào mừng bạn đến với phố ẩm thực Vĩnh Khánh, Quận 4, Thành phố Hồ Chí Minh! Đây là một trong những con phố ẩm thực nổi tiếng nhất Sài Gòn, kéo dài hơn 1 cây số với hàng trăm quán ăn đa dạng. Từ hải sản tươi sống, ốc các loại, đến các món ăn đường phố truyền thống. Hãy để ứng dụng dẫn bạn khám phá từng góc ẩm thực thú vị!" },
                        { "en", "Welcome to Vinh Khanh Food Street in District 4, Ho Chi Minh City! This is one of the most famous food streets in Saigon, stretching over 1 kilometer with hundreds of diverse restaurants. From fresh seafood and various snail dishes to traditional street food. Let our app guide you through each exciting culinary corner!" },
                    },
                    Latitude = 10.7582,
                    Longitude = 106.6965,
                    Radius = 50,
                    Priority = 1,
                    Category = "landmark",
                    Address = "Đường Khánh Hội, Phường Khánh Hội, Quận 4",
                    OpeningHours = "24/7",
                    PriceRange = "",
                    QrCode = "VK-POI-009",
                    ImageUrl = "/images/bus-stop.jpg"
                },
                new Poi
                {
                    Name = new Dictionary<string, string>
                    {
                        { "vi", "Cầu Nguyễn Văn Cừ" },
                        { "en", "Nguyen Van Cu Bridge" },
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Cầu nối Quận 1 với Quận 4, cổng chào vào phố ẩm thực Vĩnh Khánh. View đẹp về đêm với ánh đèn lung linh." },
                        { "en", "Bridge connecting District 1 and District 4, gateway to Vinh Khanh food street. Beautiful night view with sparkling lights." },
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Bạn đang ở gần Cầu Nguyễn Văn Cừ, cửa ngõ vào Quận 4 và phố ẩm thực Vĩnh Khánh! Từ đây nhìn xuống kênh Bến Nghé, bạn sẽ thấy cảnh sông nước Sài Gòn rất đẹp, nhất là vào buổi tối. Đi thẳng qua cầu khoảng 200 mét là bạn sẽ đến đầu phố ẩm thực." },
                        { "en", "You are near Nguyen Van Cu Bridge, the gateway to District 4 and Vinh Khanh food street! From here, looking down at Ben Nghe canal, you'll see beautiful Saigon waterways, especially at night. Walk straight across the bridge about 200 meters to reach the food street." },
                    },
                    Latitude = 10.7585,
                    Longitude = 106.6958,
                    Radius = 60,
                    Priority = 3,
                    Category = "landmark",
                    Address = "Cầu Nguyễn Văn Cừ, Quận 4",
                    OpeningHours = "24/7",
                    PriceRange = "",
                    QrCode = "VK-POI-010",
                    ImageUrl = "/images/cau-nvc.jpg"
                },
                new Poi
                {
                    Name = new Dictionary<string, string>
                    {
                        { "vi", "Nghêu Sò Ốc Hến 368" },
                        { "en", "Clam & Snail House 368" },
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán chuyên nghêu sò ốc hến với hàng chục món ốc đa dạng: nghêu hấp sả, sò điệp nướng mỡ hành, ốc len xào dừa. Không gian sân vườn thoáng mát." },
                        { "en", "Specializing in clams, mussels and snails with dozens of varieties: lemongrass steamed clams, grilled scallops with scallion oil, coconut stir-fried snails. Spacious garden setting." },
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Chào bạn! Đây là quán Nghêu Sò Ốc Hến 368, thiên đường cho người yêu hải sản vỏ. Quán có hàng chục loại ốc và nghêu sò khác nhau. Đặc biệt nhất là nghêu hấp sả ớt, sò điệp nướng mỡ hành và món ốc len xào dừa béo ngậy. Không gian sân vườn thoáng mát rất thích hợp cho nhóm bạn." },
                        { "en", "Welcome to Clam and Snail House 368, a paradise for shellfish lovers! The restaurant offers dozens of snail and clam varieties. The highlights are lemongrass chili steamed clams, scallion oil grilled scallops, and creamy coconut stir-fried snails. The spacious garden is perfect for groups." },
                    },
                    Latitude = 10.7575,
                    Longitude = 106.6955,
                    Radius = 35,
                    Priority = 2,
                    Category = "seafood",
                    Address = "38 Vĩnh Khánh, Phường 1, Quận 4",
                    OpeningHours = "15:00 - 23:30",
                    PriceRange = "40.000 - 180.000 VNĐ",
                    QrCode = "VK-POI-011",
                    ImageUrl = "/images/ngheu-so.jpg"
                },
                new Poi
                {
                    Name = new Dictionary<string, string>
                    {
                        { "vi", "Bò Né 3 Ngon" },
                        { "en", "3 Ngon Sizzling Beef" },
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán bò né nổi tiếng với bò bít tết, trứng ốp la, pate, bánh mì nóng trên đĩa gang nóng hổi. Bữa sáng kiểu Sài Gòn chính hiệu." },
                        { "en", "Famous sizzling beef restaurant with beef steak, fried eggs, pate, and hot bread on a sizzling iron plate. Authentic Saigon-style breakfast." },
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Đây là quán Bò Né 3 Ngon! Bò né là món ăn sáng đặc trưng của Sài Gòn. Một đĩa gang nóng bốc khói với bò bít tết mềm juicy, trứng ốp la, pate thơm béo và bánh mì nóng giòn. Chấm với tương ớt và tiêu đen. Giá chỉ từ 45 nghìn đồng cho một phần đầy đủ." },
                        { "en", "This is 3 Ngon Sizzling Beef! Bo ne is a classic Saigon breakfast dish. A smoking hot iron plate with juicy beef steak, fried eggs, savory pate, and crispy hot bread. Dip with chili sauce and black pepper. Only about 2 dollars for a full serving." },
                    },
                    Latitude = 10.7570,
                    Longitude = 106.6947,
                    Radius = 30,
                    Priority = 5,
                    Category = "street_food",
                    Address = "72 Vĩnh Khánh, Phường 1, Quận 4",
                    OpeningHours = "06:00 - 10:00, 15:00 - 21:00",
                    PriceRange = "45.000 - 85.000 VNĐ",
                    QrCode = "VK-POI-012",
                    ImageUrl = "/images/bo-ne.jpg"
                },
                new Poi
                {
                    Name = new Dictionary<string, string>
                    {
                        { "vi", "Chè Cô Năm" },
                        { "en", "Aunt Nam's Sweet Soup" },
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán chè truyền thống với hơn 30 loại chè: chè bưởi, chè ba màu, chè thái, chè đậu xanh bột báng. Tráng miệng hoàn hảo sau khi ăn hải sản." },
                        { "en", "Traditional sweet soup shop with over 30 varieties: pomelo sweet soup, three-color sweet soup, Thai sweet soup, mung bean tapioca. Perfect dessert after seafood." },
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Chè Cô Năm là quán chè lâu đời nhất phố Vĩnh Khánh! Cô Năm bán hơn 30 loại chè truyền thống. Đặc biệt nhất là chè bưởi thanh mát, chè ba màu đầy đủ đậu, thạch, nước cốt dừa, và chè khúc bạch mềm mịn. Sau khi ăn hải sản cay nóng, một ly chè mát lạnh là tuyệt vời!" },
                        { "en", "Aunt Nam's Sweet Soup is the oldest dessert shop on Vinh Khanh Street! Aunt Nam serves over 30 traditional sweet soups. The highlights are refreshing pomelo sweet soup, three-color sweet soup with beans, jelly and coconut cream, and silky panna cotta sweet soup. Perfect after spicy seafood!" },
                    },
                    Latitude = 10.7563,
                    Longitude = 106.6944,
                    Radius = 25,
                    Priority = 6,
                    Category = "snack",
                    Address = "112 Vĩnh Khánh, Phường 1, Quận 4",
                    OpeningHours = "13:00 - 22:30",
                    PriceRange = "15.000 - 40.000 VNĐ",
                    QrCode = "VK-POI-013",
                    ImageUrl = "/images/che-co-nam.jpg"
                },
                new Poi
                {
                    Name = new Dictionary<string, string>
                    {
                        { "vi", "Nướng Ngói Quận 4" },
                        { "en", "District 4 Tile-Grilled BBQ" },
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán nướng ngói độc đáo với thịt bò, bạch tuộc, tôm nướng trên ngói đất nung nóng. Phong cách nướng truyền thống miền Trung." },
                        { "en", "Unique tile-grilled BBQ with beef, octopus, and shrimp grilled on heated clay tiles. Traditional Central Vietnamese grilling style." },
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Nướng Ngói Quận 4 là quán nướng độc đáo nhất phố Vĩnh Khánh! Thịt bò, bạch tuộc và tôm được nướng trên miếng ngói đất nung thật nóng, giữ nguyên vị ngọt tự nhiên của thực phẩm. Đây là phong cách nướng truyền thống từ miền Trung Việt Nam. Kèm bún, rau sống và nước chấm mắm nêm đặc biệt." },
                        { "en", "District 4 Tile-Grilled BBQ is the most unique grill on Vinh Khanh Street! Beef, octopus and shrimp are grilled on real heated clay tiles, preserving the natural sweet flavor. This is a traditional Central Vietnamese grilling method. Served with rice noodles, fresh herbs and special anchovy dipping sauce." },
                    },
                    Latitude = 10.7567,
                    Longitude = 106.6952,
                    Radius = 30,
                    Priority = 3,
                    Category = "street_food",
                    Address = "92 Vĩnh Khánh, Phường 1, Quận 4",
                    OpeningHours = "16:00 - 23:00",
                    PriceRange = "60.000 - 180.000 VNĐ",
                    QrCode = "VK-POI-014",
                    ImageUrl = "/images/nuong-ngoi.jpg"
                },
                new Poi
                {
                    Name = new Dictionary<string, string>
                    {
                        { "vi", "Hủ Tiếu Nam Vang Quận 4" },
                        { "en", "Phnom Penh Noodle Soup Q4" },
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán hủ tiếu Nam Vang lâu đời với nước lèo trong vắt từ xương heo, tôm, thịt băm, gan heo. Phục vụ cả hủ tiếu khô và nước." },
                        { "en", "Long-standing Phnom Penh noodle soup with clear pork bone broth, shrimp, minced pork, and pork liver. Available in soup or dry style." },
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Hủ Tiếu Nam Vang Quận 4 là quán hủ tiếu lâu đời tại đây! Nước lèo trong vắt được ninh từ xương heo hàng giờ đồng hồ, ngọt tự nhiên. Trong tô có tôm tươi, thịt heo băm, gan heo, và hành phi giòn rụm. Bạn có thể chọn hủ tiếu nước hoặc hủ tiếu khô với nước lèo riêng. Mở từ 6 giờ sáng, rất thích hợp cho bữa sáng." },
                        { "en", "Phnom Penh Noodle Soup District 4 is a long-standing noodle shop! The crystal-clear broth is simmered from pork bones for hours, naturally sweet. Each bowl has fresh shrimp, minced pork, pork liver, and crispy fried shallots. Choose soup style or dry with broth on the side. Opens at 6am, perfect for breakfast." },
                    },
                    Latitude = 10.7557,
                    Longitude = 106.6942,
                    Radius = 30,
                    Priority = 4,
                    Category = "street_food",
                    Address = "156 Vĩnh Khánh, Phường 1, Quận 4",
                    OpeningHours = "06:00 - 14:00",
                    PriceRange = "40.000 - 70.000 VNĐ",
                    QrCode = "VK-POI-015",
                    ImageUrl = "/images/hu-tieu.jpg"
                }
            };

            await _pois.InsertManyAsync(pois);
        }
    }
}
