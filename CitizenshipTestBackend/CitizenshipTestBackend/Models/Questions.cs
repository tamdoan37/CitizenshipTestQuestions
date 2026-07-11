using System.ComponentModel.DataAnnotations;

namespace CitizenshipBackend.Models
{
    public class Question
    {
        [Key]
        public string QuestionId { get; set; } = string.Empty;
        public string TestVersion { get; set; } = "2008";
        public string Category { get; set; } = string.Empty;
        public string QuestionText { get; set; } = string.Empty;
        public bool IsStateSpecific { get; set; } = false;
        public bool IsFederalExecutive { get; set; } = false;
        public List<string> FixedAnswers { get; set; } = new();
        public string Hint { get; set; } = string.Empty;
        public bool IsStarredQuestion { get; set; } = false;
    }
}