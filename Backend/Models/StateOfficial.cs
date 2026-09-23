namespace CitizenFlowApi.Models;

public class StateOfficial
{
    public int Id { get; set; }
    public string StateCode { get; set; } = "";         // Two-letter: "WI"
    public string StateName { get; set; } = "";         // "Wisconsin"
    public string Capital { get; set; } = "";
    public string Governor { get; set; } = "";
    public List<string> Senators { get; set; } = [];    // JSON — always 2 entries
}
