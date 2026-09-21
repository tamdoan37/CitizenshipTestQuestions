namespace CitizenFlowApi.Models;

public class FluencySentence
{
    public int Id { get; set; }
    public string Text { get; set; } = "";
    /// <summary>"reading" or "writing"</summary>
    public string Type { get; set; } = "";
    /// <summary>1 = easy, 2 = medium, 3 = hard</summary>
    public int DifficultyLevel { get; set; } = 1;
    public List<string> CoreVocabulary { get; set; } = []; // JSON — key words to highlight
}
