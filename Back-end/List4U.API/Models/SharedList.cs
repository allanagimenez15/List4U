namespace List4U.API.Models;

public class SharedList
{
    public int Id { get; set; }
    public int ListId { get; set; }
    public int UserId { get; set; }
    public DateTime CreatedAt { get; set; }

    public List List { get; set; } = null!;
    public User User { get; set; } = null!;
}