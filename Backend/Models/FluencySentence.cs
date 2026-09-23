namespace CitizenFlowApi.Models;

public class FluencySentence
{
    public int Id { get; set; }
    /// <summary>"reading" or "writing"</summary>
    public string ExerciseType { get; set; } = "";
    public string SentenceText { get; set; } = "";
    public List<string> CoreVocabulary { get; set; } = []; // Key words to highlight
}
