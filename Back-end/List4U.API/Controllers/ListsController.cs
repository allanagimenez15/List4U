
using List4U.API.Data;
using List4U.API.DTOs;
using List4U.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace List4U.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ListsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<List>>> GetLists(
        [FromQuery] int userId)
    {
        var userExists = await _context.Users
            .AnyAsync(user => user.Id == userId);

        if (!userExists)
        {
            return NotFound(new { message = "User not found." });
        }

        var lists = await _context.Lists
            .Where(list => list.UserId == userId)
            .ToListAsync();

        return Ok(lists);
    }

    [HttpPost]
    public async Task<ActionResult> CreateList(CreateListDto listDto)
    {
        var userExists = await _context.Users
            .AnyAsync(user => user.Id == listDto.UserId);

        if (!userExists)
        {
            return NotFound(new { message = "User not found." });
        }

        var list = new List
        {
            Name = listDto.Name,
            UserId = listDto.UserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Lists.Add(list);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetLists),
            new { userId = list.UserId },
            new
            {
                list.Id,
                list.Name,
                list.CreatedAt,
                list.UserId
            }
        );
    }
}
