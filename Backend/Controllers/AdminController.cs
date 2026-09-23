using CitizenFlowApi.Data;
using CitizenFlowApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CitizenFlowApi.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController(AppDbContext db, IConfiguration config) : ControllerBase
{
    // ── FEDERAL OFFICIALS ────────────────────────────────────────────────────

    // GET /api/admin/officials/federal
    [HttpGet("officials/federal")]
    public async Task<IActionResult> GetFederalOfficials()
    {
        if (!IsAuthorized()) return Unauthorized(new { message = "Invalid or missing X-Admin-Key header." });

        var officials = await db.FederalOfficials.AsNoTracking().ToListAsync();
        return Ok(officials);
    }

    // PUT /api/admin/officials/federal/{id}
    [HttpPut("officials/federal/{id:int}")]
    public async Task<IActionResult> UpdateFederalOfficial(int id, [FromBody] FederalOfficial dto)
    {
        if (!IsAuthorized()) return Unauthorized(new { message = "Invalid or missing X-Admin-Key header." });

        var official = await db.FederalOfficials.FindAsync(id);
        if (official is null) return NotFound(new { message = $"Federal official with ID {id} not found." });

        official.Name  = dto.Name;
        official.Party = dto.Party;
        await db.SaveChangesAsync();
        return Ok(official);
    }

    // PUT /api/admin/officials/federal/title/{title}
    // Update by role name (President, VicePresident, SpeakerOfHouse, ChiefJustice)
    // so the client doesn't need to know the numeric id.
    [HttpPut("officials/federal/title/{title}")]
    public async Task<IActionResult> UpdateFederalOfficialByTitle(string title, [FromBody] FederalOfficial dto)
    {
        if (!IsAuthorized()) return Unauthorized(new { message = "Invalid or missing X-Admin-Key header." });

        var official = await db.FederalOfficials.FirstOrDefaultAsync(f => f.Title == title);
        if (official is null) return NotFound(new { message = $"Federal official '{title}' not found." });

        if (!string.IsNullOrWhiteSpace(dto.Name))  official.Name  = dto.Name;
        if (!string.IsNullOrWhiteSpace(dto.Party)) official.Party = dto.Party;
        await db.SaveChangesAsync();
        return Ok(official);
    }

    // POST /api/admin/officials/federal
    [HttpPost("officials/federal")]
    public async Task<IActionResult> CreateFederalOfficial([FromBody] FederalOfficial dto)
    {
        if (!IsAuthorized()) return Unauthorized(new { message = "Invalid or missing X-Admin-Key header." });

        if (await db.FederalOfficials.AnyAsync(f => f.Title == dto.Title))
            return Conflict(new { message = $"Official with title '{dto.Title}' already exists. Use PUT to update." });

        db.FederalOfficials.Add(dto);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetFederalOfficials), new { }, dto);
    }

    // ── STATE OFFICIALS ──────────────────────────────────────────────────────

    // GET /api/admin/officials/state
    [HttpGet("officials/state")]
    public async Task<IActionResult> GetStateOfficials()
    {
        if (!IsAuthorized()) return Unauthorized(new { message = "Invalid or missing X-Admin-Key header." });

        var states = await db.StateOfficials.AsNoTracking().OrderBy(s => s.StateCode).ToListAsync();
        return Ok(states);
    }

    // GET /api/admin/officials/state/{stateCode}
    [HttpGet("officials/state/{stateCode}")]
    public async Task<IActionResult> GetStateOfficial(string stateCode)
    {
        if (!IsAuthorized()) return Unauthorized(new { message = "Invalid or missing X-Admin-Key header." });

        var state = await db.StateOfficials.AsNoTracking()
            .FirstOrDefaultAsync(s => s.StateCode == stateCode.ToUpperInvariant());

        if (state is null) return NotFound(new { message = $"State '{stateCode}' not found." });
        return Ok(state);
    }

    // PUT /api/admin/officials/state/{stateCode}
    [HttpPut("officials/state/{stateCode}")]
    public async Task<IActionResult> UpdateStateOfficial(string stateCode, [FromBody] StateOfficial dto)
    {
        if (!IsAuthorized()) return Unauthorized(new { message = "Invalid or missing X-Admin-Key header." });

        var state = await db.StateOfficials
            .FirstOrDefaultAsync(s => s.StateCode == stateCode.ToUpperInvariant());

        if (state is null) return NotFound(new { message = $"State '{stateCode}' not found." });

        state.Governor = dto.Governor;
        state.Senators = dto.Senators;
        state.Capital  = dto.Capital;
        await db.SaveChangesAsync();
        return Ok(state);
    }

    // POST /api/admin/officials/state
    [HttpPost("officials/state")]
    public async Task<IActionResult> CreateStateOfficial([FromBody] StateOfficial dto)
    {
        if (!IsAuthorized()) return Unauthorized(new { message = "Invalid or missing X-Admin-Key header." });

        if (await db.StateOfficials.AnyAsync(s => s.StateCode == dto.StateCode))
            return Conflict(new { message = $"State '{dto.StateCode}' already exists. Use PUT to update." });

        db.StateOfficials.Add(dto);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetStateOfficials), new { }, dto);
    }

    // ── FLUENCY SENTENCES ────────────────────────────────────────────────────

    // POST /api/admin/fluency
    [HttpPost("fluency")]
    public async Task<IActionResult> CreateFluencySentence([FromBody] FluencySentence dto)
    {
        if (!IsAuthorized()) return Unauthorized(new { message = "Invalid or missing X-Admin-Key header." });

        db.FluencySentences.Add(dto);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(CreateFluencySentence), new { }, dto);
    }

    // DELETE /api/admin/fluency/{id}
    [HttpDelete("fluency/{id:int}")]
    public async Task<IActionResult> DeleteFluencySentence(int id)
    {
        if (!IsAuthorized()) return Unauthorized(new { message = "Invalid or missing X-Admin-Key header." });

        var sentence = await db.FluencySentences.FindAsync(id);
        if (sentence is null) return NotFound(new { message = $"Fluency sentence {id} not found." });

        db.FluencySentences.Remove(sentence);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // ── Helper ───────────────────────────────────────────────────────────────
    private bool IsAuthorized()
    {
        var expected = config["AdminApiKey"];
        if (string.IsNullOrWhiteSpace(expected)) return false;
        return Request.Headers.TryGetValue("X-Admin-Key", out var key) && key == expected;
    }
}
