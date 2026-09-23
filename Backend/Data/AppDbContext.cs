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
        var jsonOpts = new JsonSerializerOptions();

        var stringListConverter = new ValueConverter<List<string>, string>(
            v => JsonSerializer.Serialize(v, jsonOpts),
            v => JsonSerializer.Deserialize<List<string>>(v, jsonOpts) ?? new List<string>()
        );

        var stringListComparer = new ValueComparer<List<string>>(
            (a, b) => a != null && b != null && a.SequenceEqual(b),
            c => c.Aggregate(0, (hash, v) => HashCode.Combine(hash, v.GetHashCode())),
            c => c.ToList()
        );

        modelBuilder.Entity<Question>(e =>
        {
            e.HasIndex(q => q.QuestionId).IsUnique();
            e.Property(q => q.FixedAnswers)
             .HasConversion(stringListConverter)
             .Metadata.SetValueComparer(stringListComparer);
        });

        modelBuilder.Entity<StateOfficial>(e =>
        {
            e.HasIndex(s => s.StateCode).IsUnique();
            e.Property(s => s.Senators)
             .HasConversion(stringListConverter)
             .Metadata.SetValueComparer(stringListComparer);
        });

        modelBuilder.Entity<FederalOfficial>(e =>
        {
            e.HasIndex(f => f.Title).IsUnique();
        });

        modelBuilder.Entity<FluencySentence>(e =>
        {
            e.Property(f => f.CoreVocabulary)
             .HasConversion(stringListConverter)
             .Metadata.SetValueComparer(stringListComparer);
        });
    }
}
