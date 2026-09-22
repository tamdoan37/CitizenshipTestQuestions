using CitizenFlowApi.Data;
using CitizenFlowApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CitizenFlowApi.Controllers;

[ApiController]
[Route("api/quiz")]
public class QuizController(AppDbContext db) : ControllerBase
{
    // ── GET /api/quiz/questions?stateCode=WI&version=2008 ───────────────────
    [HttpGet("questions")]
    public async Task<IActionResult> GetQuestions(
        [FromQuery] string stateCode = "WI",
        [FromQuery] string version = "2025")
    {
        var questions = await db.Questions
            .Where(q => q.TestVersion == version)
            .AsNoTracking()
            .ToListAsync();

        var (state, officials) = await LoadContextAsync(stateCode);

        return Ok(questions.Select(q => PatchQuestion(q, state, officials)));
    }

    // ── GET /api/quiz/random?stateCode=WI&count=20&version=2008 ─────────────
    [HttpGet("random")]
    public async Task<IActionResult> GetRandom(
        [FromQuery] string stateCode = "WI",
        [FromQuery] int count = 20,
        [FromQuery] string version = "2025")
    {
        var questions = await db.Questions
            .Where(q => q.TestVersion == version)
            .AsNoTracking()
            .ToListAsync();

        var (state, officials) = await LoadContextAsync(stateCode);

        var selected = questions
            .OrderBy(_ => Guid.NewGuid())
            .Take(Math.Min(count, questions.Count))
            .Select(q => PatchQuestion(q, state, officials))
            .ToList();

        return Ok(selected);
    }

    // ── GET /api/quiz/starred?stateCode=WI&version=2008 ─────────────────────
    [HttpGet("starred")]
    public async Task<IActionResult> GetStarred(
        [FromQuery] string stateCode = "WI",
        [FromQuery] string version = "2025")
    {
        var questions = await db.Questions
            .Where(q => q.TestVersion == version && q.IsStarredQuestion)
            .AsNoTracking()
            .ToListAsync();

        var (state, officials) = await LoadContextAsync(stateCode);

        return Ok(questions.Select(q => PatchQuestion(q, state, officials)));
    }

    // ── GET /api/quiz/categories?version=2008 ───────────────────────────────
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories([FromQuery] string version = "2025")
    {
        var categories = await db.Questions
            .Where(q => q.TestVersion == version)
            .Select(q => q.Category)
            .Distinct()
            .AsNoTracking()
            .ToListAsync();

        return Ok(categories);
    }

    // ── GET /api/quiz/by-category?category=AMERICAN+HISTORY&stateCode=WI ────
    [HttpGet("by-category")]
    public async Task<IActionResult> GetByCategory(
        [FromQuery] string category,
        [FromQuery] string stateCode = "WI",
        [FromQuery] string version = "2025")
    {
        var questions = await db.Questions
            .Where(q => q.TestVersion == version && q.Category == category)
            .AsNoTracking()
            .ToListAsync();

        var (state, officials) = await LoadContextAsync(stateCode);

        return Ok(questions.Select(q => PatchQuestion(q, state, officials)));
    }

    // ── GET /api/quiz/question-of-the-day?stateCode=WI&version=2008 ─────────
    [HttpGet("question-of-the-day")]
    public async Task<IActionResult> GetQuestionOfTheDay(
        [FromQuery] string stateCode = "WI",
        [FromQuery] string version = "2025")
    {
        var questions = await db.Questions
            .Where(q => q.TestVersion == version)
            .OrderBy(q => q.QuestionId)
            .AsNoTracking()
            .ToListAsync();

        if (questions.Count == 0)
            return NotFound(new { message = "No questions available for the requested version." });

        // Deterministic daily seed: same UTC calendar day → same question for everyone.
        var dateString = DateTime.UtcNow.ToString("yyyy-MM-dd");
        var seed = 0;
        foreach (var ch in dateString) seed = unchecked(seed * 31 + ch);
        var index = Math.Abs(seed) % questions.Count;

        var (state, officials) = await LoadContextAsync(stateCode);
        var chosen = questions[index];

        return Ok(new
        {
            chosen.QuestionId,
            chosen.QuestionText,
            chosen.Category,
            FixedAnswers = PatchAnswers(chosen, state, officials),
            Date = dateString,
        });
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private async Task<(StateOfficial? state, Dictionary<string, FederalOfficial> officials)>
        LoadContextAsync(string stateCode)
    {
        var state = await db.StateOfficials
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.StateCode == stateCode.ToUpperInvariant());

        var officials = await db.FederalOfficials
            .AsNoTracking()
            .ToDictionaryAsync(f => f.Title, f => f);

        return (state, officials);
    }

    private static object PatchQuestion(
        Question q,
        StateOfficial? state,
        Dictionary<string, FederalOfficial> officials)
    {
        return new
        {
            q.Id,
            q.QuestionId,
            q.TestVersion,
            q.Category,
            q.QuestionText,
            FixedAnswers = PatchAnswers(q, state, officials),
            q.IsStarredQuestion,
            q.IsStateSpecific,
            q.IsFederalExecutive,
        };
    }

    private static List<string> PatchAnswers(
        Question q,
        StateOfficial? state,
        Dictionary<string, FederalOfficial> officials)
    {
        return q.QuestionId switch
        {
            // Q023 — one of your state's U.S. senators
            "Q023" => state?.Senators?.Count > 0
                        ? state.Senators
                        : new List<string> { "Senator information unavailable — update via Admin API." },
            // Q029 — your U.S. representative (district-specific; guide the applicant)
            "Q029" => state != null
                        ? new List<string> { $"Contact the U.S. House of Representatives for {state.StateName} district information." }
                        : new List<string> { "U.S. Representative (state not set)" },
            // Q030 — Speaker of the House now
            "Q030" => officials.TryGetValue("SpeakerOfHouse", out var speaker)
                        ? new List<string> { speaker.Name }
                        : new List<string> { "Speaker of the House data unavailable." },
            // Q038 — President now
            "Q038" => officials.TryGetValue("President", out var pres)
                        ? new List<string> { pres.Name }
                        : new List<string> { "President data unavailable." },
            // Q039 — Vice President now
            "Q039" => officials.TryGetValue("VicePresident", out var vp)
                        ? new List<string> { vp.Name }
                        : new List<string> { "Vice President data unavailable." },
            // Q057 — Chief Justice now
            "Q057" => officials.TryGetValue("ChiefJustice", out var cj)
                        ? new List<string> { cj.Name }
                        : new List<string> { "Chief Justice data unavailable." },
            // Q061 — Governor of your state now
            "Q061" => state != null
                        ? new List<string> { state.Governor }
                        : new List<string> { "Governor data unavailable." },
            // Q062 — capital of your state
            "Q062" => state != null
                        ? new List<string> { state.Capital }
                        : new List<string> { "Capital data unavailable." },
            _ => q.FixedAnswers
        };
    }
}
