using CitizenFlowApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Text.Json;

namespace CitizenFlowApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<FederalOfficial> FederalOfficials => Set<FederalOfficial>();
    public DbSet<StateOfficial> StateOfficials => Set<StateOfficial>();
    public DbSet<FluencySentence> FluencySentences => Set<FluencySentence>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var jsonOptions = new JsonSerializerOptions();

        var stringListConverter = new ValueConverter<List<string>, string>(
            v => JsonSerializer.Serialize(v, jsonOptions),
            v => JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>()
        );

        var stringListComparer = new ValueComparer<List<string>>(
            (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => c.ToList()
        );

        modelBuilder.Entity<Question>(e =>
        {
            e.Property(q => q.FixedAnswers)
             .HasConversion(stringListConverter)
             .Metadata.SetValueComparer(stringListComparer);
        });

        modelBuilder.Entity<StateOfficial>(e =>
        {
            e.HasIndex(s => s.StateAbbr).IsUnique();
            e.Property(s => s.Senators)
             .HasConversion(stringListConverter)
             .Metadata.SetValueComparer(stringListComparer);
        });

        modelBuilder.Entity<FluencySentence>(e =>
        {
            e.Property(f => f.CoreVocabulary)
             .HasConversion(stringListConverter)
             .Metadata.SetValueComparer(stringListComparer);
        });

        modelBuilder.Entity<FederalOfficial>(e =>
        {
            e.HasIndex(f => f.Role).IsUnique();
        });
    }
}
