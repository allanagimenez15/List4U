
namespace List4U.API.Models;

public class List
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public int UserId { get; set; }

    public User User { get; set; } = null!;

    public ICollection<Item> Items { get; set; } = new HashSet<Item>();
}
