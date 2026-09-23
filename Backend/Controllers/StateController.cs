using CitizenFlowApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CitizenFlowApi.Controllers;

[ApiController]
[Route("api/state")]
public class StateController(AppDbContext db) : ControllerBase
{
    // ── GET /api/state ───────────────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var states = await db.StateOfficials
            .AsNoTracking()
            .OrderBy(s => s.StateName)
            .Select(s => new { s.StateCode, s.StateName, s.Capital, s.Governor, s.Senators })
            .ToListAsync();

        return Ok(states);
    }

    // ── GET /api/state/{stateCode} ───────────────────────────────────────────
    [HttpGet("{stateCode}")]
    public async Task<IActionResult> GetByCode(string stateCode)
    {
        var state = await db.StateOfficials
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.StateCode == stateCode.ToUpperInvariant());

        if (state is null)
            return NotFound(new { message = $"State '{stateCode}' not found." });

        return Ok(state);
    }
}
