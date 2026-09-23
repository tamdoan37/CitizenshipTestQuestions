using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace CitizenshipBackend.Tests;

public class QuizControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    private static readonly JsonSerializerOptions JsonOpts =
        new() { PropertyNameCaseInsensitive = true };

    public QuizControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private sealed record QuestionDto(
        int Id, string QuestionId, string TestVersion, string Category,
        string QuestionText, List<string> FixedAnswers,
        bool IsStarredQuestion, bool IsStateSpecific, bool IsFederalExecutive);

    private async Task<List<QuestionDto>> GetQuestionsAsync(string query)
    {
        var response = await _client.GetAsync($"/api/quiz/questions{query}");
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<List<QuestionDto>>(body, JsonOpts) ?? new();
    }

    [Fact]
    public async Task Questions_Version2025_ReturnsOnly2025Questions()
    {
        var questions = await GetQuestionsAsync("?version=2025");

        Assert.Equal(128, questions.Count);
        Assert.All(questions, q => Assert.Equal("2025", q.TestVersion));
    }

    [Fact]
    public async Task Questions_ForWisconsin_PatchesGovernorWithSeededName()
    {
        var questions = await GetQuestionsAsync("?stateCode=WI&version=2025");

        var governorQuestion = questions.Single(q => q.QuestionText.Contains("governor of your state"));
        Assert.Contains("Tony Evers", governorQuestion.FixedAnswers);
        // The default placeholder must have been replaced.
        Assert.DoesNotContain(governorQuestion.FixedAnswers, a => a.Contains("unavailable"));
    }

    [Fact]
    public async Task Questions_ForWisconsin_PatchesSenatorsWithSeededNames()
    {
        var questions = await GetQuestionsAsync("?stateCode=WI&version=2025");

        var senatorQuestion = questions.Single(q =>
            q.QuestionText.Contains("state's U.S. senators"));
        Assert.Contains("Tammy Baldwin", senatorQuestion.FixedAnswers);
        Assert.Contains("Ron Johnson", senatorQuestion.FixedAnswers);
    }

    [Fact]
    public async Task Questions_PatchesPresidentWithSeededName()
    {
        var questions = await GetQuestionsAsync("?stateCode=WI&version=2025");

        var presidentQuestion = questions.Single(q =>
            q.QuestionText.Contains("name of the President of the United States now"));
        Assert.Contains("Donald J. Trump", presidentQuestion.FixedAnswers);
    }

    [Fact]
    public async Task Questions_WithInvalidStateCode_DoesNotReturn500()
    {
        var response = await _client.GetAsync("/api/quiz/questions?stateCode=ZZ&version=2025");

        Assert.NotEqual(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        var questions = JsonSerializer.Deserialize<List<QuestionDto>>(body, JsonOpts) ?? new();
        Assert.NotEmpty(questions);

        // State-specific answers should fall back gracefully, not throw.
        var governorQuestion = questions.Single(q => q.QuestionText.Contains("governor of your state"));
        Assert.NotEmpty(governorQuestion.FixedAnswers);
    }

    [Fact]
    public async Task QuestionOfTheDay_ReturnsDeterministicQuestionForToday()
    {
        var first = await _client.GetFromJsonAsync<QotdDto>(
            "/api/quiz/question-of-the-day?stateCode=WI&version=2025", JsonOpts);
        var second = await _client.GetFromJsonAsync<QotdDto>(
            "/api/quiz/question-of-the-day?stateCode=WI&version=2025", JsonOpts);

        Assert.NotNull(first);
        Assert.NotNull(second);
        Assert.Equal(first!.QuestionId, second!.QuestionId);
        Assert.Equal(DateTime.UtcNow.ToString("yyyy-MM-dd"), first.Date);
        Assert.NotEmpty(first.FixedAnswers);
    }

    [Fact]
    public async Task Questions_JsonUsesCamelCase()
    {
        var response = await _client.GetAsync("/api/quiz/questions?stateCode=WI&version=2025");
        var raw = await response.Content.ReadAsStringAsync();

        // camelCase keys must be present (matches the Angular Question interface).
        Assert.Contains("\"questionId\"", raw);
        Assert.Contains("\"fixedAnswers\"", raw);
        Assert.DoesNotContain("\"QuestionId\"", raw);
    }

    private sealed record QotdDto(
        string QuestionId, string QuestionText, string Category,
        List<string> FixedAnswers, string Date);
}
