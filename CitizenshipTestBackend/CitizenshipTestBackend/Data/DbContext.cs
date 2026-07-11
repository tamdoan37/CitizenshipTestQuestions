using CitizenshipBackend.Models;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;
using System.Text.Json;

namespace CitizenshipBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Question> Questions { get; set; } = null!;
        public DbSet<StateOfficial> StateOfficials { get; set; } = null!;
        public DbSet<FluencySentence> FluencySentences { get; set; } = null!;
        public DbSet<FederalOfficial> FederalOfficials { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Question>()
                .Property(p => p.FixedAnswers)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null!),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null!) ?? new List<string>());

            modelBuilder.Entity<StateOfficial>()
                .Property(p => p.Senators)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null!),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null!) ?? new List<string>());

            modelBuilder.Entity<FluencySentence>()
                .Property(p => p.CoreVocabulary)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null!),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null!) ?? new List<string>());
        }
    }
}