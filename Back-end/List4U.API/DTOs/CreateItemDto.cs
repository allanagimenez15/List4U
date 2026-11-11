
using System.ComponentModel.DataAnnotations;

namespace List4U.API.DTOs;

public class CreateItemDto
{
    [Required]
    [StringLength(150)]
    public string Name { get; set; } = string.Empty;

    [Range(typeof(decimal), "0", "99999999.99", ParseLimitsInInvariantCulture = true)]
    public decimal Price { get; set; }

    [Required]
    public int ListId { get; set; }
}