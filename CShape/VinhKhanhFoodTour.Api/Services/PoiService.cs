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
                        { "ja", "オックダオ・ヴィンカイン" },
                        { "zh", "螺蛳岛永庆" }
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán ốc nổi tiếng nhất phố Vĩnh Khánh, chuyên các món ốc hấp, ốc xào, ốc nướng với hương vị đậm đà. Quán đã hoạt động hơn 20 năm và là điểm đến không thể bỏ qua." },
                        { "en", "The most famous snail restaurant on Vinh Khanh Street, specializing in steamed, stir-fried, and grilled snails with rich flavors. Operating for over 20 years." },
                        { "ja", "ヴィンカイン通りで最も有名なカタツムリレストラン。蒸し、炒め、焼きカタツムリを専門とし、20年以上営業しています。" },
                        { "zh", "永庆街最著名的螺蛳餐厅，专营蒸、炒、烤螺蛳，口味浓郁。经营超过20年。" }
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Xin chào! Bạn đang đến gần Ốc Đào Vĩnh Khánh, quán ốc nổi tiếng nhất con phố này. Được thành lập hơn 20 năm trước, đây là nơi bạn có thể thưởng thức các món ốc hấp sả, ốc xào bơ tỏi, và ốc nướng mỡ hành tuyệt vời. Giá trung bình từ 50 đến 150 nghìn đồng một món." },
                        { "en", "Welcome! You are approaching Oc Dao Vinh Khanh, the most famous snail restaurant on this street. Established over 20 years ago, this is where you can enjoy amazing steamed lemongrass snails, garlic butter stir-fried snails, and grilled snails with scallion oil. Average price is 2 to 6 dollars per dish." },
                        { "ja", "ようこそ！ヴィンカイン通りで最も有名なカタツムリレストラン「オックダオ」に近づいています。20年以上の歴史があり、レモングラス蒸しカタツムリやガーリックバター炒めなど、素晴らしい料理を楽しめます。" },
                        { "zh", "欢迎！您正在接近永庆街最著名的螺蛳餐厅——螺蛳岛。这家餐厅已有20多年历史，您可以在这里品尝香茅蒸螺蛳、蒜蓉黄油炒螺蛳等美味佳肴。" }
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
                        { "ja", "ナムダイン・シーフード" },
                        { "zh", "南亭海鲜" }
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán hải sản tươi sống với tôm, cua, ghẹ, mực được đánh bắt hàng ngày. Nổi tiếng với lẩu hải sản và cua rang me." },
                        { "en", "Fresh seafood restaurant with daily caught shrimp, crab, and squid. Famous for seafood hotpot and tamarind crab." },
                        { "ja", "毎日獲れたてのエビ、カニ、イカが楽しめる新鮮なシーフードレストラン。シーフード鍋とタマリンドクラブが有名。" },
                        { "zh", "新鲜海鲜餐厅，每日供应虾、蟹、鱿鱼。以海鲜火锅和罗望子蟹闻名。" }
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Bạn đang đến Hải Sản Năm Đảnh! Đây là quán hải sản tươi sống nổi tiếng trên phố Vĩnh Khánh. Hải sản được đánh bắt hàng ngày, đảm bảo tươi ngon. Món đặc biệt là lẩu hải sản chua cay và cua rang me. Giá rất hợp lý so với chất lượng." },
                        { "en", "You are approaching Nam Danh Seafood! This famous seafood restaurant on Vinh Khanh Street serves daily fresh-caught seafood. Their specialties include spicy sour seafood hotpot and tamarind crab. Great value for the quality." },
                        { "ja", "ナムダイン・シーフードに近づいています！ヴィンカイン通りの有名なシーフードレストランで、毎日新鮮な魚介類を提供しています。スパイシーサワーシーフード鍋とタマリンドクラブがおすすめです。" },
                        { "zh", "您正在接近南亭海鲜！这是永庆街著名的海鲜餐厅，每日供应新鲜海鲜。招牌菜包括酸辣海鲜火锅和罗望子蟹。性价比很高。" }
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
                        { "ja", "ヴィンカイン・ヤギ鍋" },
                        { "zh", "永庆羊肉火锅" }
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán lẩu dê truyền thống với nhiều món từ dê: lẩu dê, dê nướng, dê xào lăn. Thịt dê tươi, không hôi, rất mềm." },
                        { "en", "Traditional goat hotpot restaurant with various goat dishes: hotpot, grilled, and stir-fried. Fresh, tender goat meat without any gamey smell." },
                        { "ja", "伝統的なヤギ鍋レストラン。鍋、グリル、炒め物など様々なヤギ料理を提供。新鮮で柔らかいヤギ肉。" },
                        { "zh", "传统羊肉火锅餐厅，提供各种羊肉菜肴：火锅、烤肉和炒菜。新鲜嫩滑的羊肉，没有膻味。" }
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Chào mừng bạn đến với Lẩu Dê Vĩnh Khánh! Đây là một trong những quán lẩu dê ngon nhất Sài Gòn. Thịt dê được chọn lọc kỹ càng, tươi ngon và không có mùi hôi. Bạn nên thử lẩu dê nấm và dê nướng tảng. Quán mở từ 4 giờ chiều." },
                        { "en", "Welcome to Vinh Khanh Goat Hotpot! This is one of the best goat hotpot restaurants in Saigon. The goat meat is carefully selected, fresh and without any gamey smell. Try their mushroom goat hotpot and grilled goat. Opens at 4pm." },
                        { "ja", "ヴィンカイン・ヤギ鍋へようこそ！サイゴンで最高のヤギ鍋レストランの一つです。丁寧に選ばれた新鮮なヤギ肉を使用しています。キノコヤギ鍋とグリルヤギがおすすめです。" },
                        { "zh", "欢迎来到永庆羊肉火锅！这是西贡最好的羊肉火锅餐厅之一。羊肉经过精心挑选，新鲜无膻味。推荐蘑菇羊肉锅和烤羊肉。" }
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
                        { "ja", "ヴィンカイン・コムタム" },
                        { "zh", "永庆碎米饭" }
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán cơm tấm bình dân với sườn nướng than hoa, bì, chả, trứng ốp la. Phục vụ từ sáng sớm đến tối." },
                        { "en", "Affordable broken rice with charcoal-grilled pork chop, shredded pork skin, meatloaf, and fried egg. Served from early morning to night." },
                        { "ja", "炭火焼きポークチョップ、細切り豚皮、ミートローフ、目玉焼きの手頃な割れ米。朝から夜まで営業。" },
                        { "zh", "平价碎米饭，配有炭烤排骨、猪皮丝、肉饼和煎蛋。从清晨营业到晚上。" }
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Bạn đang ở gần Cơm Tấm Vĩnh Khánh! Đây là quán cơm tấm bình dân nhưng cực kỳ ngon. Sườn được nướng trên than hoa nóng, thơm phức, kèm với bì, chả, trứng ốp la và nước mắm chua ngọt. Một dĩa cơm chỉ từ 35 nghìn đồng, phục vụ cả ngày." },
                        { "en", "You are near Vinh Khanh Broken Rice! This is a humble but incredibly delicious broken rice shop. The pork chop is grilled over hot charcoal, served with shredded pork skin, meatloaf, fried egg, and sweet fish sauce. A plate costs only about 1.5 dollars." },
                        { "ja", "ヴィンカイン・コムタムの近くです！素朴ですが信じられないほど美味しい割れ米店です。ポークチョップは熱い炭火で焼かれ、細切り豚皮、ミートローフ、目玉焼きと一緒に提供されます。" },
                        { "zh", "您在永庆碎米饭附近！这是一家朴素但极其美味的碎米饭店。排骨在炭火上烤制，配有猪皮丝、肉饼、煎蛋和甜鱼露。一盘只需约1.5美元。" }
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
                        { "ja", "コートゥーのライスペーパーサラダ" },
                        { "zh", "四姨拌米纸" }
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Xe bánh tráng trộn nổi tiếng với đầy đủ topping: trứng cút, khô bò, mắm ruốc, rau răm. Món ăn vặt đường phố đặc trưng Sài Gòn." },
                        { "en", "Famous mixed rice paper cart with full toppings: quail eggs, beef jerky, shrimp paste, and herbs. An iconic Saigon street snack." },
                        { "ja", "ウズラの卵、ビーフジャーキー、エビペースト、ハーブなどのトッピングが豊富な有名なライスペーパーサラダ。サイゴンを代表するストリートスナック。" },
                        { "zh", "著名的拌米纸摊位，配料丰富：鹌鹑蛋、牛肉干、虾酱和香草。西贡标志性的街头小吃。" }
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Đây là xe Bánh Tráng Trộn Cô Tư nổi tiếng! Bánh tráng trộn là món ăn vặt đường phố đặc trưng của Sài Gòn. Bánh tráng được cắt nhỏ, trộn với trứng cút, khô bò, mắm ruốc, rau răm, đậu phộng rang. Vị chua cay mặn ngọt hài hòa. Chỉ 20 nghìn một bịch." },
                        { "en", "This is the famous Aunt Tu's Mixed Rice Paper! Mixed rice paper is an iconic Saigon street snack. Rice paper is cut into strips and mixed with quail eggs, beef jerky, shrimp paste, Vietnamese herbs, and roasted peanuts. A perfect harmony of sour, spicy, salty and sweet flavors." },
                        { "ja", "有名なコートゥーのライスペーパーサラダです！サイゴンを代表するストリートスナックで、ライスペーパーを細切りにし、ウズラの卵、ビーフジャーキー、エビペースト、ベトナムハーブ、ローストピーナッツと混ぜ合わせます。" },
                        { "zh", "这是著名的四姨拌米纸！拌米纸是西贡标志性的街头小吃。将米纸切成条状，与鹌鹑蛋、牛肉干、虾酱、越南香草和烤花生混合。酸辣咸甜完美和谐。" }
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
                        { "ja", "コーバーのブンマム" },
                        { "zh", "三姨鱼露米粉" }
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Bún mắm miền Tây với nước lèo đậm đà từ mắm cá linh, hải sản tươi, rau sống. Hương vị truyền thống Nam Bộ." },
                        { "en", "Southern Vietnamese fermented fish noodle soup with rich broth, fresh seafood, and herbs. Authentic Mekong Delta flavors." },
                        { "ja", "メコンデルタの伝統的な発酵魚麺。濃厚なスープ、新鮮なシーフード、ハーブ。本格的な南ベトナムの味。" },
                        { "zh", "南越鱼露米粉汤，汤底浓郁，配有新鲜海鲜和香草。正宗湄公河三角洲风味。" }
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Bún Mắm Cô Ba là quán bún mắm ngon nổi tiếng! Nước lèo được nấu từ mắm cá linh miền Tây, đậm đà thơm ngon. Trong tô bún có tôm, mực, cá, thịt heo quay và rau sống tươi xanh. Đây là hương vị đặc trưng miền Tây Nam Bộ giữa lòng Sài Gòn." },
                        { "en", "Aunt Ba's Fermented Fish Noodle is a famous noodle shop! The broth is made from Mekong Delta fermented fish, rich and aromatic. Each bowl contains shrimp, squid, fish, roasted pork, and fresh herbs. This is authentic Southern Vietnamese flavor in the heart of Saigon." },
                        { "ja", "コーバーのブンマムは有名な麺料理店です！メコンデルタの発酵魚から作られた濃厚で香り豊かなスープ。エビ、イカ、魚、ローストポーク、新鮮なハーブが入っています。" },
                        { "zh", "三姨鱼露米粉是一家著名的米粉店！汤底由湄公河三角洲的发酵鱼制成，浓郁芳香。每碗都有虾、鱿鱼、鱼、烤肉和新鲜香草。" }
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
                        { "ja", "4区タマリンドクラブ" },
                        { "zh", "四区罗望子蟹" }
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán chuyên cua rang me, cua sốt trứng muối, cua lột chiên giòn. Cua tươi sống được chế biến tại bàn." },
                        { "en", "Specializing in tamarind crab, salted egg crab, and crispy soft-shell crab. Live crabs prepared at your table." },
                        { "ja", "タマリンドクラブ、塩卵クラブ、クリスピーソフトシェルクラブを専門としています。活きたカニをテーブルで調理。" },
                        { "zh", "专营罗望子蟹、咸蛋蟹和脆皮软壳蟹。活蟹在餐桌上现做。" }
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Đến Cua Rang Me Quận 4! Đây là thiên đường dành cho người yêu cua. Cua được chọn tươi sống, rang với nước me chua ngọt thấm đều. Ngoài ra còn có cua sốt trứng muối béo ngậy và cua lột chiên giòn tan. Nhớ kêu thêm bánh mì chấm nước sốt nhé!" },
                        { "en", "Welcome to District 4 Tamarind Crab! This is paradise for crab lovers. Fresh live crabs are wok-fried with sweet and sour tamarind sauce. Also try the creamy salted egg crab and crispy soft-shell crab. Don't forget to order bread to dip in the sauce!" },
                        { "ja", "4区タマリンドクラブへようこそ！カニ好きの楽園です。新鮮な活きガニを甘酸っぱいタマリンドソースで炒めます。クリーミーな塩卵カニとサクサクのソフトシェルクラブもお試しください。" },
                        { "zh", "欢迎来到四区罗望子蟹！这是螃蟹爱好者的天堂。新鲜活蟹用酸甜罗望子酱翻炒。还可以尝试奶油咸蛋蟹和脆皮软壳蟹。别忘了点面包蘸酱汁！" }
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
                        { "ja", "ソムチエウ市場" },
                        { "zh", "芹蕉市场" }
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Chợ truyền thống lâu đời nhất Quận 4, nơi cung cấp nguyên liệu tươi sống cho toàn bộ phố ẩm thực. Có nhiều quán ăn ngon bên trong chợ." },
                        { "en", "The oldest traditional market in District 4, supplying fresh ingredients for the entire food street. Many delicious food stalls inside." },
                        { "ja", "4区で最も古い伝統市場で、食品通り全体に新鮮な食材を供給しています。市場内には多くの美味しい屋台があります。" },
                        { "zh", "四区最古老的传统市场，为整条美食街供应新鲜食材。市场内有许多美味的小吃摊。" }
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Bạn đang ở gần Chợ Xóm Chiếu, ngôi chợ truyền thống lâu đời nhất Quận 4! Chợ là nguồn cung cấp nguyên liệu tươi sống cho toàn bộ phố ẩm thực Vĩnh Khánh. Bên trong chợ có nhiều quán ăn bình dân ngon và rẻ. Đây cũng là nơi người dân địa phương sinh hoạt hàng ngày, mang đậm nét văn hóa Sài Gòn." },
                        { "en", "You are near Xom Chieu Market, the oldest traditional market in District 4! This market supplies fresh ingredients for the entire Vinh Khanh food street. Inside, you'll find many affordable and delicious food stalls. This is also where locals do their daily shopping, showing authentic Saigon culture." },
                        { "ja", "4区で最も古い伝統市場、ソムチエウ市場の近くです！この市場はヴィンカイン美食通り全体に新鮮な食材を供給しています。市場内には手頃で美味しい屋台がたくさんあります。" },
                        { "zh", "您在芹蕉市场附近，这是四区最古老的传统市场！这个市场为永庆美食街供应新鲜食材。市场内有许多实惠美味的小吃摊。这里也是当地人日常购物的地方，展现了正宗的西贡文化。" }
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
                        { "ja", "カインホイバス停" },
                        { "zh", "庆会公交站" }
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Điểm dừng xe buýt chính gần phố ẩm thực. Có QR Code để quét và bắt đầu tour thuyết minh ngay khi xuống xe." },
                        { "en", "Main bus stop near the food street. QR Code available to scan and start the audio tour right after getting off the bus." },
                        { "ja", "美食通り近くのメインバス停。バスを降りてすぐにQRコードをスキャンしてオーディオツアーを開始できます。" },
                        { "zh", "美食街附近的主要公交站。下车后可立即扫描二维码开始语音导览。" }
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Chào mừng bạn đến với phố ẩm thực Vĩnh Khánh, Quận 4, Thành phố Hồ Chí Minh! Đây là một trong những con phố ẩm thực nổi tiếng nhất Sài Gòn, kéo dài hơn 1 cây số với hàng trăm quán ăn đa dạng. Từ hải sản tươi sống, ốc các loại, đến các món ăn đường phố truyền thống. Hãy để ứng dụng dẫn bạn khám phá từng góc ẩm thực thú vị!" },
                        { "en", "Welcome to Vinh Khanh Food Street in District 4, Ho Chi Minh City! This is one of the most famous food streets in Saigon, stretching over 1 kilometer with hundreds of diverse restaurants. From fresh seafood and various snail dishes to traditional street food. Let our app guide you through each exciting culinary corner!" },
                        { "ja", "ホーチミン市4区のヴィンカイン美食通りへようこそ！サイゴンで最も有名な美食通りの一つで、1キロメートル以上に渡って数百のレストランが並んでいます。新鮮なシーフードから伝統的なストリートフードまで。アプリがご案内します！" },
                        { "zh", "欢迎来到胡志明市四区的永庆美食街！这是西贡最著名的美食街之一，绵延超过1公里，拥有数百家风格各异的餐厅。从新鲜海鲜到传统街头小吃。让我们的应用带您探索每个美食角落！" }
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
                        { "ja", "グエンヴァンクー橋" },
                        { "zh", "阮文举桥" }
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Cầu nối Quận 1 với Quận 4, cổng chào vào phố ẩm thực Vĩnh Khánh. View đẹp về đêm với ánh đèn lung linh." },
                        { "en", "Bridge connecting District 1 and District 4, gateway to Vinh Khanh food street. Beautiful night view with sparkling lights." },
                        { "ja", "1区と4区を結ぶ橋。ヴィンカイン美食通りへのゲートウェイ。きらめくライトの美しい夜景。" },
                        { "zh", "连接一区和四区的桥梁，永庆美食街的入口。夜晚灯光闪烁，景色优美。" }
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Bạn đang ở gần Cầu Nguyễn Văn Cừ, cửa ngõ vào Quận 4 và phố ẩm thực Vĩnh Khánh! Từ đây nhìn xuống kênh Bến Nghé, bạn sẽ thấy cảnh sông nước Sài Gòn rất đẹp, nhất là vào buổi tối. Đi thẳng qua cầu khoảng 200 mét là bạn sẽ đến đầu phố ẩm thực." },
                        { "en", "You are near Nguyen Van Cu Bridge, the gateway to District 4 and Vinh Khanh food street! From here, looking down at Ben Nghe canal, you'll see beautiful Saigon waterways, especially at night. Walk straight across the bridge about 200 meters to reach the food street." },
                        { "ja", "グエンヴァンクー橋の近くです。4区とヴィンカイン美食通りへの玄関口です！ベンゲー運河を見下ろすと、特に夜は美しいサイゴンの水路が見えます。橋を渡って約200メートルで美食通りに到着します。" },
                        { "zh", "您在阮文举桥附近，这是通往四区和永庆美食街的门户！从这里俯瞰槟艺运河，您将看到美丽的西贡水道，尤其是在夜晚。过桥直行约200米即可到达美食街。" }
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
                        { "ja", "貝とカタツムリハウス368" },
                        { "zh", "蛤蜊螺蛳屋368" }
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán chuyên nghêu sò ốc hến với hàng chục món ốc đa dạng: nghêu hấp sả, sò điệp nướng mỡ hành, ốc len xào dừa. Không gian sân vườn thoáng mát." },
                        { "en", "Specializing in clams, mussels and snails with dozens of varieties: lemongrass steamed clams, grilled scallops with scallion oil, coconut stir-fried snails. Spacious garden setting." },
                        { "ja", "貝類とカタツムリを専門とし、レモングラス蒸しアサリ、ネギ油焼きホタテ、ココナッツ炒めカタツムリなど多彩なメニュー。広々とした庭園空間。" },
                        { "zh", "专营蛤蜊、贻贝和螺蛳，数十种品种：香茅蒸蛤蜊、葱油烤扇贝、椰子炒螺蛳。宽敞的花园环境。" }
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Chào bạn! Đây là quán Nghêu Sò Ốc Hến 368, thiên đường cho người yêu hải sản vỏ. Quán có hàng chục loại ốc và nghêu sò khác nhau. Đặc biệt nhất là nghêu hấp sả ớt, sò điệp nướng mỡ hành và món ốc len xào dừa béo ngậy. Không gian sân vườn thoáng mát rất thích hợp cho nhóm bạn." },
                        { "en", "Welcome to Clam and Snail House 368, a paradise for shellfish lovers! The restaurant offers dozens of snail and clam varieties. The highlights are lemongrass chili steamed clams, scallion oil grilled scallops, and creamy coconut stir-fried snails. The spacious garden is perfect for groups." },
                        { "ja", "貝とカタツムリハウス368へようこそ！貝類愛好家の楽園です。数十種類のカタツムリと貝類を提供しています。レモングラスチリ蒸しアサリ、ネギ油焼きホタテ、クリーミーなココナッツ炒めカタツムリが人気です。" },
                        { "zh", "欢迎来到蛤蜊螺蛳屋368！这是贝类爱好者的天堂。餐厅提供数十种螺蛳和蛤蜊品种。招牌菜是香茅辣椒蒸蛤蜊、葱油烤扇贝和奶油椰子炒螺蛳。" }
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
                        { "ja", "3ゴン鉄板ビーフ" },
                        { "zh", "3好铁板牛肉" }
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán bò né nổi tiếng với bò bít tết, trứng ốp la, pate, bánh mì nóng trên đĩa gang nóng hổi. Bữa sáng kiểu Sài Gòn chính hiệu." },
                        { "en", "Famous sizzling beef restaurant with beef steak, fried eggs, pate, and hot bread on a sizzling iron plate. Authentic Saigon-style breakfast." },
                        { "ja", "ビーフステーキ、目玉焼き、パテ、熱いパンを鉄板で提供する有名な鉄板ビーフ店。正統派サイゴン式朝食。" },
                        { "zh", "著名的铁板牛肉店，提供牛排、煎蛋、肉酱和热面包，盛在滋滋作响的铁板上。正宗西贡式早餐。" }
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Đây là quán Bò Né 3 Ngon! Bò né là món ăn sáng đặc trưng của Sài Gòn. Một đĩa gang nóng bốc khói với bò bít tết mềm juicy, trứng ốp la, pate thơm béo và bánh mì nóng giòn. Chấm với tương ớt và tiêu đen. Giá chỉ từ 45 nghìn đồng cho một phần đầy đủ." },
                        { "en", "This is 3 Ngon Sizzling Beef! Bo ne is a classic Saigon breakfast dish. A smoking hot iron plate with juicy beef steak, fried eggs, savory pate, and crispy hot bread. Dip with chili sauce and black pepper. Only about 2 dollars for a full serving." },
                        { "ja", "3ゴン鉄板ビーフです！ボーネーはサイゴンの定番朝食です。熱々の鉄板にジューシーなビーフステーキ、目玉焼き、パテ、サクサクのパンが乗っています。チリソースと黒コショウで。" },
                        { "zh", "这是3好铁板牛肉！铁板牛肉是西贡经典早餐。滋滋冒烟的铁板上有多汁牛排、煎蛋、肉酱和脆面包。蘸辣椒酱和黑胡椒。一份只需约2美元。" }
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
                        { "ja", "コーナムのチェー" },
                        { "zh", "五姨甜汤" }
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán chè truyền thống với hơn 30 loại chè: chè bưởi, chè ba màu, chè thái, chè đậu xanh bột báng. Tráng miệng hoàn hảo sau khi ăn hải sản." },
                        { "en", "Traditional sweet soup shop with over 30 varieties: pomelo sweet soup, three-color sweet soup, Thai sweet soup, mung bean tapioca. Perfect dessert after seafood." },
                        { "ja", "30種類以上のチェーを提供する伝統的なスイーツ店：ポメロチェー、三色チェー、タイチェー、緑豆タピオカ。シーフードの後のデザートに最適。" },
                        { "zh", "传统甜汤店，提供30多种甜汤：柚子甜汤、三色甜汤、泰式甜汤、绿豆西米。吃完海鲜后的完美甜点。" }
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Chè Cô Năm là quán chè lâu đời nhất phố Vĩnh Khánh! Cô Năm bán hơn 30 loại chè truyền thống. Đặc biệt nhất là chè bưởi thanh mát, chè ba màu đầy đủ đậu, thạch, nước cốt dừa, và chè khúc bạch mềm mịn. Sau khi ăn hải sản cay nóng, một ly chè mát lạnh là tuyệt vời!" },
                        { "en", "Aunt Nam's Sweet Soup is the oldest dessert shop on Vinh Khanh Street! Aunt Nam serves over 30 traditional sweet soups. The highlights are refreshing pomelo sweet soup, three-color sweet soup with beans, jelly and coconut cream, and silky panna cotta sweet soup. Perfect after spicy seafood!" },
                        { "ja", "コーナムのチェーはヴィンカイン通りで最も古いデザートショップです！30種類以上の伝統的なチェーを提供しています。さわやかなポメロチェー、三色チェー、シルキーなパンナコッタチェーが人気です。" },
                        { "zh", "五姨甜汤是永庆街最古老的甜品店！五姨提供30多种传统甜汤。招牌是清爽的柚子甜汤、三色甜汤和丝滑的奶冻甜汤。吃完辛辣海鲜后来一杯冰凉甜汤太棒了！" }
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
                        { "ja", "4区瓦焼きBBQ" },
                        { "zh", "四区瓦片烧烤" }
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán nướng ngói độc đáo với thịt bò, bạch tuộc, tôm nướng trên ngói đất nung nóng. Phong cách nướng truyền thống miền Trung." },
                        { "en", "Unique tile-grilled BBQ with beef, octopus, and shrimp grilled on heated clay tiles. Traditional Central Vietnamese grilling style." },
                        { "ja", "牛肉、タコ、エビを熱い瓦の上で焼くユニークな瓦焼きBBQ。伝統的な中部ベトナムのグリルスタイル。" },
                        { "zh", "独特的瓦片烧烤，将牛肉、章鱼和虾在加热的陶瓦上烤制。传统的越南中部烧烤风格。" }
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Nướng Ngói Quận 4 là quán nướng độc đáo nhất phố Vĩnh Khánh! Thịt bò, bạch tuộc và tôm được nướng trên miếng ngói đất nung thật nóng, giữ nguyên vị ngọt tự nhiên của thực phẩm. Đây là phong cách nướng truyền thống từ miền Trung Việt Nam. Kèm bún, rau sống và nước chấm mắm nêm đặc biệt." },
                        { "en", "District 4 Tile-Grilled BBQ is the most unique grill on Vinh Khanh Street! Beef, octopus and shrimp are grilled on real heated clay tiles, preserving the natural sweet flavor. This is a traditional Central Vietnamese grilling method. Served with rice noodles, fresh herbs and special anchovy dipping sauce." },
                        { "ja", "4区瓦焼きBBQはヴィンカイン通りで最もユニークなグリルです！牛肉、タコ、エビを本物の熱い瓦の上で焼き、食材の自然な甘みを保ちます。中部ベトナムの伝統的なグリル方法です。" },
                        { "zh", "四区瓦片烧烤是永庆街最独特的烧烤！牛肉、章鱼和虾在真正的加热陶瓦上烤制，保留食材的天然甜味。这是越南中部的传统烧烤方法。配米粉、新鲜香草和特制鱼露蘸酱。" }
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
                        { "ja", "プノンペン麺Q4" },
                        { "zh", "四区金边粉" }
                    },
                    Description = new Dictionary<string, string>
                    {
                        { "vi", "Quán hủ tiếu Nam Vang lâu đời với nước lèo trong vắt từ xương heo, tôm, thịt băm, gan heo. Phục vụ cả hủ tiếu khô và nước." },
                        { "en", "Long-standing Phnom Penh noodle soup with clear pork bone broth, shrimp, minced pork, and pork liver. Available in soup or dry style." },
                        { "ja", "豚骨クリアスープ、エビ、豚ひき肉、豚レバーの伝統的なプノンペン麺。スープとドライスタイルがあります。" },
                        { "zh", "历史悠久的金边粉，清澈的猪骨汤底，配虾、猪肉末和猪肝。提供汤粉和干粉两种。" }
                    },
                    TtsScript = new Dictionary<string, string>
                    {
                        { "vi", "Hủ Tiếu Nam Vang Quận 4 là quán hủ tiếu lâu đời tại đây! Nước lèo trong vắt được ninh từ xương heo hàng giờ đồng hồ, ngọt tự nhiên. Trong tô có tôm tươi, thịt heo băm, gan heo, và hành phi giòn rụm. Bạn có thể chọn hủ tiếu nước hoặc hủ tiếu khô với nước lèo riêng. Mở từ 6 giờ sáng, rất thích hợp cho bữa sáng." },
                        { "en", "Phnom Penh Noodle Soup District 4 is a long-standing noodle shop! The crystal-clear broth is simmered from pork bones for hours, naturally sweet. Each bowl has fresh shrimp, minced pork, pork liver, and crispy fried shallots. Choose soup style or dry with broth on the side. Opens at 6am, perfect for breakfast." },
                        { "ja", "4区プノンペン麺は歴史あるラーメン店です！透き通ったスープは豚骨を何時間も煮込んで作られ、自然な甘みがあります。新鮮なエビ、豚ひき肉、豚レバー、サクサクのフライドシャロットが入っています。" },
                        { "zh", "四区金边粉是一家历史悠久的粉店！清澈的汤底用猪骨熬制数小时，自然甘甜。每碗都有鲜虾、猪肉末、猪肝和酥脆炸葱。可选汤粉或干粉配汤。早上6点开门，非常适合早餐。" }
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
