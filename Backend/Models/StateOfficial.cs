namespace CitizenFlowApi.Models;

public class StateOfficial
{
    public int Id { get; set; }
    public string StateAbbr { get; set; } = "";  // Two-letter code: "WI"
    public string StateName { get; set; } = "";  // Full name: "Wisconsin"
    public string Governor { get; set; } = "";
    public List<string> Senators { get; set; } = []; // JSON — exactly 2 entries
    public string Capital { get; set; } = "";
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
