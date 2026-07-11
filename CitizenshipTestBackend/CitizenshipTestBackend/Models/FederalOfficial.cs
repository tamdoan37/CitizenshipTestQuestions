using System.ComponentModel.DataAnnotations;

namespace CitizenshipBackend.Models
{
    public class FederalOfficial
    {
        [Key]
        public string Role { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Party { get; set; } = string.Empty;
        public DateTime LastSyncedAt { get; set; } = DateTime.UtcNow;
    }
}