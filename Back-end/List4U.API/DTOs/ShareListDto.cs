using System.ComponentModel.DataAnnotations;

namespace List4U.API.DTOs;

public class ShareListDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
