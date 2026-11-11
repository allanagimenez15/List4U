
using System.ComponentModel.DataAnnotations;

namespace List4U.API.DTOs;

public class CreateListDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public int UserId { get; set; }
}
