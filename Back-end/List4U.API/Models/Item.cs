
namespace List4U.API.Models;

public class Item
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public bool IsCompleted { get; set; }

    public int ListId { get; set; }

    public List List { get; set; } = null!;
}
