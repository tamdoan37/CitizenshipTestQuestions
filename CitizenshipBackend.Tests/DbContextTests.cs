using CitizenFlowApi.Data;
using CitizenFlowApi.Models;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace CitizenshipBackend.Tests;

/// <summary>
/// Verifies the EF Core System.Text.Json value converters round-trip
/// List&lt;string&gt; columns through SQLite without data loss.
/// </summary>
public class DbContextTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly DbContextOptions<AppDbContext> _options;

    public DbContextTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
        _options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_connection)
            .Options;

        using var ctx = new AppDbContext(_options);
        ctx.Database.EnsureCreated();
    }

    [Fact]
    public void Question_FixedAnswersList_RoundTripsWithoutLoss()
    {
        var answers = new List<string> { "speech", "religion", "assembly", "press", "petition the government" };

        using (var write = new AppDbContext(_options))
        {
            write.Questions.Add(new Question
            {
                QuestionId = "Q006",
                TestVersion = "2008",
                Category = "AMERICAN GOVERNMENT",
                QuestionText = "What is one right or freedom from the First Amendment?",
                FixedAnswers = answers,
                IsStarredQuestion = true,
            });
            write.SaveChanges();
        }

        using var read = new AppDbContext(_options);
        var loaded = read.Questions.Single(q => q.QuestionId == "Q006");

        Assert.Equal(answers, loaded.FixedAnswers);
        Assert.Equal(5, loaded.FixedAnswers.Count);
        Assert.Equal("petition the government", loaded.FixedAnswers[4]);
    }

    [Fact]
    public void StateOfficial_SenatorsList_RoundTrips()
    {
        using (var write = new AppDbContext(_options))
        {
            write.StateOfficials.Add(new StateOfficial
            {
                StateCode = "WI",
                StateName = "Wisconsin",
                Capital = "Madison",
                Governor = "Tony Evers",
                Senators = new List<string> { "Tammy Baldwin", "Ron Johnson" },
            });
            write.SaveChanges();
        }

        using var read = new AppDbContext(_options);
        var wi = read.StateOfficials.Single(s => s.StateCode == "WI");

        Assert.Equal(2, wi.Senators.Count);
        Assert.Contains("Tammy Baldwin", wi.Senators);
        Assert.Contains("Ron Johnson", wi.Senators);
    }

    [Fact]
    public void Question_EmptyFixedAnswers_RoundTripsAsEmptyList()
    {
        using (var write = new AppDbContext(_options))
        {
            write.Questions.Add(new Question
            {
                QuestionId = "Q999",
                TestVersion = "2008",
                Category = "TEST",
                QuestionText = "Placeholder?",
                FixedAnswers = new List<string>(),
            });
            write.SaveChanges();
        }

        using var read = new AppDbContext(_options);
        var q = read.Questions.Single(x => x.QuestionId == "Q999");
        Assert.NotNull(q.FixedAnswers);
        Assert.Empty(q.FixedAnswers);
    }

    [Fact]
    public void Question_QuestionIdUniqueIndex_IsEnforced()
    {
        using var ctx = new AppDbContext(_options);
        ctx.Questions.Add(new Question { QuestionId = "Q100", TestVersion = "2008", Category = "C", QuestionText = "A?", FixedAnswers = new() { "x" } });
        ctx.SaveChanges();

        ctx.Questions.Add(new Question { QuestionId = "Q100", TestVersion = "2008", Category = "C", QuestionText = "B?", FixedAnswers = new() { "y" } });
        Assert.ThrowsAny<DbUpdateException>(() => ctx.SaveChanges());
    }

    public void Dispose()
    {
        _connection.Dispose();
    }
}
