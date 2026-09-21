namespace CitizenFlowApi.Models;

public class Question
{
    public int Id { get; set; }                        // 1–100 USCIS question number
    public string QuestionText { get; set; } = "";
    public List<string> FixedAnswers { get; set; } = []; // JSON — static answers; empty for dynamic Qs
    public string Category { get; set; } = "";           // AMERICAN GOVERNMENT / AMERICAN HISTORY / INTEGRATED CIVICS
    public string SubCategory { get; set; } = "";        // E.g. "Principles of American Democracy"
    public bool IsDynamic { get; set; }                  // True → answers patched from officials DB at runtime
    public bool Is65PlusExempt { get; set; }             // Included in 65+/20yr exception question set
    public bool IsFrequent { get; set; }                 // Higher SRS starting weight (appears often on tests)
}
