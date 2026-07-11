using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CitizenshipBackend.Data;

namespace CitizenshipBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StateController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StateController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<IActionResult> GetAllStates()
            => Ok(await _context.StateOfficials.AsNoTracking().ToListAsync());

        [HttpGet("{stateCode}")]
        public async Task<IActionResult> GetState(string stateCode)
        {
            var state = await _context.StateOfficials.AsNoTracking()
                .FirstOrDefaultAsync(s => s.StateCode == stateCode.ToUpper());
            if (state == null) return NotFound(new { error = $"State '{stateCode}' not found." });
            return Ok(state);
        }
    }
}