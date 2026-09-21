namespace CitizenFlowApi.Models;

public class Question
{
    public int Id { get; set; }
    public string QuestionId { get; set; } = "";        // "Q020", "Q028", etc.
    public string TestVersion { get; set; } = "2008";   // "2008" or "2020"
    public string Category { get; set; } = "";
    public string QuestionText { get; set; } = "";
    public List<string> FixedAnswers { get; set; } = [];
    public bool IsStarredQuestion { get; set; }         // Frequently tested; higher SRS start weight
    public bool IsStateSpecific { get; set; }           // Answers require state officials lookup
    public bool IsFederalExecutive { get; set; }        // Answers require federal officials lookup
}
