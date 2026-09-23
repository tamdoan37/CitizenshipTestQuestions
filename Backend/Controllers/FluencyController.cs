using CitizenFlowApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CitizenFlowApi.Controllers;

[ApiController]
[Route("api/fluency")]
public class FluencyController(AppDbContext db) : ControllerBase
{
    // ── GET /api/fluency?type=reading ────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? type = null)
    {
        var query = db.FluencySentences.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(f => f.ExerciseType == type.ToLowerInvariant());

        var sentences = await query.OrderBy(f => f.Id).ToListAsync();
        return Ok(sentences);
    }

    // ── GET /api/fluency/random?type=reading ─────────────────────────────────
    [HttpGet("random")]
    public async Task<IActionResult> GetRandom([FromQuery] string? type = null)
    {
        var query = db.FluencySentences.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(f => f.ExerciseType == type.ToLowerInvariant());

        var count = await query.CountAsync();
        if (count == 0)
            return NotFound(new { message = "No fluency sentences found." });

        var sentence = await query
            .Skip(Random.Shared.Next(count))
            .FirstAsync();

        return Ok(sentence);
    }
}
