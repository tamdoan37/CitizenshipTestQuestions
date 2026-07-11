using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CitizenshipBackend.Data;
using CitizenshipBackend.Services;

namespace CitizenshipBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly WikiScraperService _scraper;
        private readonly AppDbContext _context;

        public AdminController(WikiScraperService scraper, AppDbContext context)
        {
            _scraper = scraper;
            _context = context;
        }

        [HttpGet("sync-all")]
        public async Task<IActionResult> SyncAll()
        {
            await _scraper.SyncAllAsync();
            return Ok(new { success = true, message = "All officials synced from Wikipedia.", timestamp = DateTime.UtcNow });
        }

        [HttpGet("sync-federal")]
        public async Task<IActionResult> SyncFederal()
        {
            await _scraper.SyncFederalOfficialsAsync();
            return Ok(new { success = true, message = "Federal officials synced.", timestamp = DateTime.UtcNow });
        }

        [HttpGet("sync-governors")]
        public async Task<IActionResult> SyncGovernors()
        {
            await _scraper.SyncGovernorsAsync();
            return Ok(new { success = true, message = "Governors synced.", timestamp = DateTime.UtcNow });
        }

        [HttpGet("sync-senators")]
        public async Task<IActionResult> SyncSenators()
        {
            await _scraper.SyncSenatorsAsync();
            return Ok(new { success = true, message = "Senators synced.", timestamp = DateTime.UtcNow });
        }

        [HttpGet("federal-officials")]
        public async Task<IActionResult> GetFederalOfficials()
            => Ok(await _context.FederalOfficials.AsNoTracking().ToListAsync());
    }
}