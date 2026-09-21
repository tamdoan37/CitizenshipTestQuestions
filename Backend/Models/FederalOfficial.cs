namespace CitizenFlowApi.Models;

public class FederalOfficial
{
    public int Id { get; set; }
    /// <summary>President | VicePresident | SpeakerOfHouse | ChiefJustice</summary>
    public string Title { get; set; } = "";
    public string Name { get; set; } = "";
    public string Party { get; set; } = "";
}
