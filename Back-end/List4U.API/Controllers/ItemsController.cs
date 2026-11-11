
using List4U.API.Data;
using List4U.API.DTOs;
using List4U.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace List4U.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ItemsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Item>>> GetItems(
        [FromQuery] int listId)
    {
        var listExists = await _context.Lists
            .AnyAsync(list => list.Id == listId);

        if (!listExists)
        {
            return NotFound(new { message = "List not found." });
        }

        var items = await _context.Items
            .Where(item => item.ListId == listId)
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult> CreateItem(CreateItemDto itemDto)
    {
        var listExists = await _context.Lists
            .AnyAsync(list => list.Id == itemDto.ListId);

        if (!listExists)
        {
            return NotFound(new { message = "List not found." });
        }

        var item = new Item
        {
            Name = itemDto.Name,
            Price = itemDto.Price,
            ListId = itemDto.ListId,
            IsCompleted = false
        };

        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetItems),
            new { listId = item.ListId },
            new
            {
                item.Id,
                item.Name,
                item.Price,
                item.IsCompleted,
                item.ListId
            }
        );
    }

    [HttpPut("{id}/completion")]
    public async Task<ActionResult> UpdateCompletion(
        int id,
        [FromBody] bool isCompleted)
    {
        var item = await _context.Items.FindAsync(id);

        if (item == null)
        {
            return NotFound(new { message = "Item not found." });
        }

        item.IsCompleted = isCompleted;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            item.Id,
            item.Name,
            item.IsCompleted
        });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateItem(
        int id,
        UpdateItemDto itemDto)
    {
        var item = await _context.Items.FindAsync(id);

        if (item == null)
        {
            return NotFound(new { message = "Item not found." });
        }

        item.Name = itemDto.Name;
        item.Price = itemDto.Price;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            item.Id,
            item.Name,
            item.Price,
            item.IsCompleted,
            item.ListId
        });
    }
}
