// File: AudioGuide.Api/Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using AudioGuide.Api.Models;

namespace AudioGuide.Api.Data
{
    /// <summary>
    /// DbContext chính của ứng dụng Audio Guide System
    /// Quản lý các entity: PointOfInterest, AudioContent
    /// </summary>
    public class AppDbContext : DbContext
    {
        /// <summary>
        /// Constructor của AppDbContext
        /// </summary>
        /// <param name="options">Cấu hình DbContext thông qua Dependency Injection</param>
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        /// <summary>
        /// DbSet cho bảng PointOfInterest
        /// </summary>
        public DbSet<PointOfInterest> PointsOfInterest { get; set; } = null!;

        /// <summary>
        /// DbSet cho bảng AudioContent
        /// </summary>
        public DbSet<AudioContent> AudioContents { get; set; } = null!;

        /// <summary>
        /// Cấu hình các Model và Relationship trong OnModelCreating
        /// </summary>
        /// <param name="modelBuilder">ModelBuilder để cấu hình các Entity</param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ========== Cấu hình bảng PointOfInterest ==========
            modelBuilder.Entity<PointOfInterest>(entity =>
            {
                // Đặt Primary Key
                entity.HasKey(e => e.PoiId);

                // Cấu hình các cột
                entity.Property(e => e.PoiId)
                    .HasDefaultValueSql("NEWID()") // Tự động sinh GUID
                    .ValueGeneratedOnAdd();

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(500)
                    .HasComment("Tên địa điểm du lịch");

                entity.Property(e => e.Latitude)
                    .HasPrecision(10, 8) // Độ chính xác GPS: 10 chữ số, 8 thập phân
                    .HasComment("Vĩ độ (Latitude)");

                entity.Property(e => e.Longitude)
                    .HasPrecision(11, 8) // Độ chính xác GPS: 11 chữ số, 8 thập phân
                    .HasComment("Kinh độ (Longitude)");

                entity.Property(e => e.TriggerRadius)
                    .IsRequired()
                    .HasDefaultValue(100)
                    .HasComment("Bán kính kích hoạt GPS (mét)");

                entity.Property(e => e.Priority)
                    .IsRequired()
                    .HasDefaultValue(5)
                    .HasComment("Độ ưu tiên (1-10)");

                entity.Property(e => e.ImageUrl)
                    .HasMaxLength(1000)
                    .HasComment("URL hình ảnh minh họa");

                entity.Property(e => e.QrCodeHash)
                    .IsRequired()
                    .HasMaxLength(255)
                    .HasComment("Mã băm QR Code");

                entity.Property(e => e.CreatedAt)
                    .IsRequired()
                    .HasDefaultValueSql("GETUTCDATE()")
                    .HasComment("Ngày giờ tạo");

                entity.Property(e => e.UpdatedAt)
                    .IsRequired()
                    .HasDefaultValueSql("GETUTCDATE()")
                    .HasComment("Ngày giờ cập nhật");

                // Tạo Index cho Latitude, Longitude để tối ưu tìm kiếm gần vị trí
                entity.HasIndex(e => new { e.Latitude, e.Longitude })
                    .HasName("IX_PoI_Location");

                // Tạo Index cho QrCodeHash để tìm kiếm nhanh qua QR
                entity.HasIndex(e => e.QrCodeHash)
                    .IsUnique()
                    .HasName("IX_PoI_QrCodeHash");

                // Cấu hình Relationship: 1 POI - N AudioContent (One-to-Many)
                entity.HasMany(e => e.AudioContents)
                    .WithOne(e => e.PointOfInterest)
                    .HasForeignKey(e => e.PoiId)
                    .OnDelete(DeleteBehavior.Cascade) // Xóa POI sẽ xóa toàn bộ AudioContent liên quan
                    .HasConstraintName("FK_AudioContent_PointOfInterest");
            });

            // ========== Cấu hình bảng AudioContent ==========
            modelBuilder.Entity<AudioContent>(entity =>
            {
                // Đặt Primary Key
                entity.HasKey(e => e.ContentId);

                // Cấu hình các cột
                entity.Property(e => e.ContentId)
                    .HasDefaultValueSql("NEWID()")
                    .ValueGeneratedOnAdd();

                entity.Property(e => e.PoiId)
                    .IsRequired()
                    .HasComment("Foreign Key đến PointOfInterest");

                entity.Property(e => e.LanguageCode)
                    .IsRequired()
                    .HasMaxLength(10)
                    .HasDefaultValue("vi")
                    .HasComment("Mã ngôn ngữ (vi, en, jp, etc.)");

                entity.Property(e => e.TextDescription)
                    .IsRequired()
                    .HasColumnType("NVARCHAR(MAX)")
                    .HasComment("Nội dung mô tả văn bản");

                entity.Property(e => e.AudioUrl)
                    .HasMaxLength(1000)
                    .HasComment("URL file audio thuyết minh");

                entity.Property(e => e.DurationInSeconds)
                    .HasComment("Thời lượng audio (giây)");

                entity.Property(e => e.CreatedAt)
                    .IsRequired()
                    .HasDefaultValueSql("GETUTCDATE()")
                    .HasComment("Ngày giờ tạo");

                entity.Property(e => e.UpdatedAt)
                    .IsRequired()
                    .HasDefaultValueSql("GETUTCDATE()")
                    .HasComment("Ngày giờ cập nhật");

                // Tạo Index tức thời tìm kiếm theo PoiId và LanguageCode
                entity.HasIndex(e => new { e.PoiId, e.LanguageCode })
                    .IsUnique()
                    .HasName("IX_AudioContent_PoiId_Language");
            });
        }
    }
}
