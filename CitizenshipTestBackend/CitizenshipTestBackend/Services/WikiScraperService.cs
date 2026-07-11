using CitizenshipBackend.Data;
using CitizenshipBackend.Models;
using HtmlAgilityPack;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace CitizenshipBackend.Services
{
    public class WikiScraperService
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _httpClient;

        private static readonly Dictionary<string, string> FederalOfficePages = new()
        {
            ["President"] = "President_of_the_United_States",
            ["VicePresident"] = "Vice_President_of_the_United_States",
            ["ChiefJustice"] = "Chief_Justice_of_the_United_States",
            ["SpeakerOfTheHouse"] = "Speaker_of_the_United_States_House_of_Representatives"
        };

        public WikiScraperService(AppDbContext context, HttpClient httpClient)
        {
            _context = context;
            _httpClient = httpClient;
            _httpClient.DefaultRequestHeaders.TryAddWithoutValidation(
                "User-Agent", "USCitizenshipApp/1.0 (educational-app; contact: dev@citizenshipapp.com)");
        }

        public async Task SyncFederalOfficialsAsync()
        {
            Console.WriteLine("Syncing federal officials from Wikipedia...");
            foreach (var (role, page) in FederalOfficePages)
                await SyncFederalRoleAsync(role, page);
            Console.WriteLine("Federal officials sync complete.");
        }

        private async Task SyncFederalRoleAsync(string role, string wikiPage)
        {
            try
            {
                var url = $"https://en.wikipedia.org/w/api.php?action=parse&page={wikiPage}&format=json&prop=text&section=0";
                var json = await _httpClient.GetStringAsync(url);

                using var doc = JsonDocument.Parse(json);
                var rawHtml = doc.RootElement.GetProperty("parse").GetProperty("text").GetProperty("*").GetString() ?? "";

                var htmlDoc = new HtmlDocument();
                htmlDoc.LoadHtml(rawHtml);

                var name = ExtractIncumbentFromInfobox(htmlDoc);
                var party = ExtractPartyFromInfobox(htmlDoc);

                if (string.IsNullOrWhiteSpace(name))
                {
                    Console.WriteLine($"  Could not extract name for {role}.");
                    return;
                }

                var record = await _context.FederalOfficials.FindAsync(role);
                if (record == null)
                {
                    _context.FederalOfficials.Add(new FederalOfficial
                    {
                        Role = role,
                        Name = name,
                        Party = party,
                        LastSyncedAt = DateTime.UtcNow
                    });
                }
                else
                {
                    record.Name = name;
                    record.Party = party;
                    record.LastSyncedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                Console.WriteLine($"  {role}: {name} ({party})");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"  Error syncing {role}: {ex.Message}");
            }
        }

        private static string ExtractIncumbentFromInfobox(HtmlDocument htmlDoc)
        {
            var rows = htmlDoc.DocumentNode.SelectNodes("//table[contains(@class,'infobox')]//tr");
            if (rows != null)
            {
                foreach (var row in rows)
                {
                    var th = row.SelectSingleNode(".//th");
                    if (th == null) continue;
                    if (!CleanHtml(th.InnerText).Contains("Incumbent", StringComparison.OrdinalIgnoreCase)) continue;

                    var td = row.SelectSingleNode(".//td");
                    if (td == null) continue;

                    var link = td.SelectSingleNode(".//a");
                    var name = CleanHtml(link?.InnerText ?? td.InnerText);
                    if (!string.IsNullOrWhiteSpace(name)) return name;
                }
            }

            var vcardName = htmlDoc.DocumentNode
                .SelectSingleNode("//table[contains(@class,'infobox')]//td[contains(@class,'infobox-data')]//a");
            if (vcardName != null)
            {
                var name = CleanHtml(vcardName.InnerText);
                if (!string.IsNullOrWhiteSpace(name)) return name;
            }

            return string.Empty;
        }

        private static string ExtractPartyFromInfobox(HtmlDocument htmlDoc)
        {
            var rows = htmlDoc.DocumentNode.SelectNodes("//table[contains(@class,'infobox')]//tr");
            if (rows == null) return string.Empty;

            foreach (var row in rows)
            {
                var th = row.SelectSingleNode(".//th");
                if (th == null) continue;

                var thText = CleanHtml(th.InnerText);
                if (!thText.Contains("Political party", StringComparison.OrdinalIgnoreCase) &&
                    !thText.Contains("Party", StringComparison.OrdinalIgnoreCase)) continue;

                var td = row.SelectSingleNode(".//td");
                if (td == null) continue;

                var link = td.SelectSingleNode(".//a");
                return CleanHtml(link?.InnerText ?? td.InnerText);
            }

            return string.Empty;
        }

        // ── STATE GOVERNORS ───────────────────────────────────────────────────

        public async Task SyncGovernorsAsync()
        {
            try
            {
                Console.WriteLine("Fetching Governors from Wikipedia...");
                var url = "https://en.wikipedia.org/w/api.php?action=parse&page=List_of_current_United_States_governors&format=json&prop=text";
                var json = await _httpClient.GetStringAsync(url);

                using var doc = JsonDocument.Parse(json);
                var rawHtml = doc.RootElement.GetProperty("parse").GetProperty("text").GetProperty("*").GetString() ?? "";

                var htmlDoc = new HtmlDocument();
                htmlDoc.LoadHtml(rawHtml);

                var rows = htmlDoc.DocumentNode.SelectNodes("//table[contains(@class,'wikitable')]//tr");
                if (rows == null) return;

                int matched = 0;
                foreach (var row in rows.Skip(1))
                {
                    var cells = row.SelectNodes("td");
                    if (cells == null || cells.Count < 2) continue;

                    var stateName = CleanHtml(cells[0].InnerText);

                    // Scan all cells for the first <a> link that looks like a person's name
                    string governorName = string.Empty;
                    foreach (var cell in cells)
                    {
                        var links = cell.SelectNodes(".//a[@title]");
                        if (links == null) continue;
                        foreach (var link in links)
                        {
                            var text = CleanHtml(link.InnerText);
                            var title = link.GetAttributeValue("title", "");
                            if (text.Length > 3
                                && !title.StartsWith("File:")
                                && !title.StartsWith("Image:")
                                && !string.Equals(text, stateName, StringComparison.OrdinalIgnoreCase))
                            {
                                governorName = text;
                                break;
                            }
                        }
                        if (!string.IsNullOrEmpty(governorName)) break;
                    }

                    if (string.IsNullOrWhiteSpace(stateName) || string.IsNullOrWhiteSpace(governorName)) continue;

                    var state = await _context.StateOfficials.FirstOrDefaultAsync(s => s.StateName == stateName);
                    if (state != null)
                    {
                        state.Governor = governorName;
                        state.LastSyncedAt = DateTime.UtcNow;
                        matched++;
                        Console.WriteLine($"  {stateName}: {governorName}");
                    }
                }

                await _context.SaveChangesAsync();
                Console.WriteLine($"Governors sync complete. Matched {matched} states.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Governor sync error: {ex.Message}");
            }
        }

        // ── STATE SENATORS ────────────────────────────────────────────────────

        public async Task SyncSenatorsAsync()
        {
            try
            {
                Console.WriteLine("Fetching Senators from Wikipedia...");
                var url = "https://en.wikipedia.org/w/api.php?action=parse&page=List_of_current_United_States_senators&format=json&prop=text";
                var json = await _httpClient.GetStringAsync(url);

                using var doc = JsonDocument.Parse(json);
                var rawHtml = doc.RootElement.GetProperty("parse").GetProperty("text").GetProperty("*").GetString() ?? "";

                var htmlDoc = new HtmlDocument();
                htmlDoc.LoadHtml(rawHtml);

                var rows = htmlDoc.DocumentNode.SelectNodes("//table[contains(@class,'wikitable')]//tr");
                if (rows == null) return;

                var stateMap = new Dictionary<string, List<string>>();

                foreach (var row in rows.Skip(1))
                {
                    var th = row.SelectSingleNode("th");
                    var tds = row.SelectNodes("td");
                    if (th == null || tds == null || tds.Count < 2) continue;

                    var stateName = CleanHtml(th.InnerText);
                    var senatorNode = tds[0].SelectSingleNode(".//a[@title]");
                    var senatorName = CleanHtml(senatorNode?.InnerText ?? tds[0].InnerText);

                    if (string.IsNullOrWhiteSpace(stateName) || string.IsNullOrWhiteSpace(senatorName)) continue;

                    if (!stateMap.ContainsKey(stateName)) stateMap[stateName] = new List<string>();
                    if (stateMap[stateName].Count < 2) stateMap[stateName].Add(senatorName);
                }

                int matched = 0;
                foreach (var (stateName, senators) in stateMap)
                {
                    if (senators.Count == 2)
                    {
                        var state = await _context.StateOfficials.FirstOrDefaultAsync(s => s.StateName == stateName);
                        if (state != null)
                        {
                            state.Senators = senators;
                            state.LastSyncedAt = DateTime.UtcNow;
                            matched++;
                            Console.WriteLine($"  {stateName}: {string.Join(", ", senators)}");
                        }
                    }
                }

                await _context.SaveChangesAsync();
                Console.WriteLine($"Senators sync complete. Matched {matched} states.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Senator sync error: {ex.Message}");
            }
        }

        // ── SYNC ALL ──────────────────────────────────────────────────────────

        public async Task SyncAllAsync()
        {
            await SyncFederalOfficialsAsync();
            await SyncGovernorsAsync();
            await SyncSenatorsAsync();
        }

        // ── HELPERS ───────────────────────────────────────────────────────────

        private static string CleanText(string input) =>
            Regex.Replace(input, @"\[.*?\]", "").Trim();

        private static string CleanHtml(string input)
        {
            var decoded = System.Net.WebUtility.HtmlDecode(input);
            var noRefs = Regex.Replace(decoded, @"\[.*?\]", "");
            return Regex.Replace(noRefs, @"\s+", " ").Trim();
        }
    }
}