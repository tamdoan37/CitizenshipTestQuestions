using System.ComponentModel.DataAnnotations;

namespace CitizenshipBackend.Models
{
    public class StateOfficial
    {
        [Key]
        public string StateCode { get; set; } = string.Empty;
        public string StateName { get; set; } = string.Empty;
        public string Governor { get; set; } = string.Empty;
        public List<string> Senators { get; set; } = new();
        public string Capital { get; set; } = string.Empty;
        public DateTime LastSyncedAt { get; set; } = DateTime.UtcNow;
    }
}