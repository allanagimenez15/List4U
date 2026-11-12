
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
    public async Task<ActionResult> GetLists([FromQuery] int userId)
    {
        var userExists = await _context.Users
            .AnyAsync(user => user.Id == userId);

        if (!userExists)
        {
            return NotFound(new { message = "User not found." });
        }

        var lists = await _context.Lists
            .Where(list =>
                list.UserId == userId ||
                _context.SharedLists.Any(shared =>
                    shared.ListId == list.Id &&
                    shared.UserId == userId))
            .Select(list => new
            {
                list.Id,
                list.Name,
                list.CreatedAt,
                list.UserId,
                IsShared = list.UserId != userId
            })
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


    [HttpPost("{listId}/share")]
    public async Task<ActionResult> ShareList(
        int listId,
        [FromQuery] int ownerUserId,
        ShareListDto shareListDto)
    {
        // Verifica se a lista existe e pertence ao usuário solicitante.
        var list = await _context.Lists
            .FirstOrDefaultAsync(list =>
                list.Id == listId &&
                list.UserId == ownerUserId);

        if (list == null)
        {
            return NotFound(new { message = "List not found." });
        }

        // Localiza o usuário pelo e-mail informado.
        var email = shareListDto.Email.Trim();

        var user = await _context.Users
            .FirstOrDefaultAsync(user => user.Email == email);

        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        // Impede compartilhar a lista com o próprio proprietário.
        if (user.Id == ownerUserId)
        {
            return BadRequest(new
            {
                message = "You cannot share a list with yourself."
            });
        }

        // Verifica se o compartilhamento já existe.
        var alreadyShared = await _context.SharedLists
            .AnyAsync(shared =>
                shared.ListId == listId &&
                shared.UserId == user.Id);

        if (alreadyShared)
        {
            return Conflict(new
            {
                message = "This list is already shared with this user."
            });
        }

        // Registra o compartilhamento.
        var sharedList = new SharedList
        {
            ListId = listId,
            UserId = user.Id
        };

        _context.SharedLists.Add(sharedList);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "List shared successfully.",
            sharedList.Id,
            sharedList.ListId,
            sharedList.UserId,
            sharedList.CreatedAt
        });
    }

}
