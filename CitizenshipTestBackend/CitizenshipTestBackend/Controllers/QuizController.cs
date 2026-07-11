using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CitizenshipBackend.Data;
using CitizenshipBackend.Models;

namespace CitizenshipBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuizController(AppDbContext context) { _context = context; }

        [HttpGet("questions")]
        public async Task<IActionResult> GetQuestions([FromQuery] string version = "2008", [FromQuery] string? stateCode = null)
        {
            var questions = await _context.Questions
                .Where(q => q.TestVersion == version || q.TestVersion == "both")
                .AsNoTracking().ToListAsync();

            StateOfficial? stateData = null;
            if (!string.IsNullOrEmpty(stateCode))
                stateData = await _context.StateOfficials.AsNoTracking()
                    .FirstOrDefaultAsync(s => s.StateCode == stateCode.ToUpper());

            var federalOfficials = await _context.FederalOfficials.AsNoTracking()
                .ToDictionaryAsync(f => f.Role, f => f);

            foreach (var q in questions)
            {
                if (q.IsStateSpecific && stateData != null)
                {
                    if (q.QuestionText.Contains("Senator"))
                        q.FixedAnswers = stateData.Senators;
                    else if (q.QuestionText.Contains("Governor"))
                        q.FixedAnswers = new List<string> { stateData.Governor };
                    else if (q.QuestionText.Contains("capital"))
                        q.FixedAnswers = new List<string> { stateData.Capital };
                    else if (q.QuestionText.Contains("Representative"))
                        q.FixedAnswers = new List<string> { "Answers vary - visit house.gov" };
                }
                else if (q.IsFederalExecutive)
                {
                    var text = q.QuestionText;
                    if (text.Contains("President of the United States now"))
                        q.FixedAnswers = GetFederalAnswer(federalOfficials, "President");
                    else if (text.Contains("Vice President"))
                        q.FixedAnswers = GetFederalAnswer(federalOfficials, "VicePresident");
                    else if (text.Contains("Chief Justice"))
                        q.FixedAnswers = GetFederalAnswer(federalOfficials, "ChiefJustice");
                    else if (text.Contains("Speaker"))
                        q.FixedAnswers = GetFederalAnswer(federalOfficials, "SpeakerOfTheHouse");
                    else if (text.Contains("political party of the President"))
                        q.FixedAnswers = federalOfficials.TryGetValue("President", out var p) && !string.IsNullOrEmpty(p.Party)
                            ? new List<string> { p.Party }
                            : new List<string> { "Not yet synced - call /api/admin/sync-all" };
                }
            }

            return Ok(questions);
        }

        [HttpGet("random")]
        public async Task<IActionResult> GetRandomQuiz([FromQuery] string version = "2008", [FromQuery] int limit = 10)
        {
            var questions = await _context.Questions
                .Where(q => q.TestVersion == version || q.TestVersion == "both")
                .AsNoTracking().ToListAsync();
            return Ok(questions.OrderBy(_ => Guid.NewGuid()).Take(limit).ToList());
        }

        [HttpGet("starred")]
        public async Task<IActionResult> GetStarredQuestions()
            => Ok(await _context.Questions.Where(q => q.IsStarredQuestion).AsNoTracking().ToListAsync());

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
            => Ok(await _context.Questions.Select(q => q.Category).Distinct().ToListAsync());

        [HttpGet("by-category")]
        public async Task<IActionResult> GetByCategory([FromQuery] string category, [FromQuery] string version = "2008")
            => Ok(await _context.Questions
                .Where(q => q.Category == category && (q.TestVersion == version || q.TestVersion == "both"))
                .AsNoTracking().ToListAsync());

        private static List<string> GetFederalAnswer(Dictionary<string, FederalOfficial> officials, string role)
            => officials.TryGetValue(role, out var o) && !string.IsNullOrEmpty(o.Name)
                ? new List<string> { o.Name }
                : new List<string> { "Not yet synced - call /api/admin/sync-all" };
    }
}