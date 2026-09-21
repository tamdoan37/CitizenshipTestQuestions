namespace CitizenFlowApi.Models;

public class FederalOfficial
{
    public int Id { get; set; }
    /// <summary>
    /// Known roles: President, VicePresident, SpeakerOfHouse, ChiefJustice
    /// </summary>
    public string Role { get; set; } = "";
    public string Name { get; set; } = "";
    public string? PartyAffiliation { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
