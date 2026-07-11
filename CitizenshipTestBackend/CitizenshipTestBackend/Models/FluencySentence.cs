using System.ComponentModel.DataAnnotations;

namespace CitizenshipBackend.Models
{
    public class FluencySentence
    {
        [Key]
        public int Id { get; set; }
        public string ExerciseType { get; set; } = "reading";
        public string SentenceText { get; set; } = string.Empty;
        public List<string> CoreVocabulary { get; set; } = new();
    }
}