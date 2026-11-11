using System.ComponentModel.DataAnnotations;

namespace List4U.API.DTOs;

public class UpdateItemDto
{
    [Required]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;

    [Range(typeof(decimal), "0", "99999999.99")]
    public decimal Price { get; set; }
}