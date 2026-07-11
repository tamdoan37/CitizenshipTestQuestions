using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CitizenshipBackend.Data;

namespace CitizenshipBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FluencyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FluencyController(AppDbContext context) { _context = context; }

        [HttpGet]
        public async Task<IActionResult> GetExercises([FromQuery] string? type = null)
        {
            var query = _context.FluencySentences.AsQueryable();
            if (!string.IsNullOrEmpty(type))
                query = query.Where(f => f.ExerciseType == type);
            return Ok(await query.AsNoTracking().ToListAsync());
        }

        [HttpGet("random")]
        public async Task<IActionResult> GetRandomExercise([FromQuery] string? type = null, [FromQuery] int limit = 5)
        {
            var all = await _context.FluencySentences
                .Where(f => type == null || f.ExerciseType == type)
                .AsNoTracking().ToListAsync();
            return Ok(all.OrderBy(_ => Guid.NewGuid()).Take(limit));
        }
    }
}