
using List4U.API.Data;
using List4U.API.DTOs;
using List4U.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace List4U.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        var users = await _context.Users
            .Select(user => new User
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                CreatedAt = user.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }


    [HttpPost]
    public async Task<ActionResult> CreateUser(CreateUserDto userDto)
    {
        var emailExists = await _context.Users
            .AnyAsync(user => user.Email == userDto.Email);

        if (emailExists)
        {
            return Conflict(new { message = "Email already registered." });
        }

        var passwordHasher = new PasswordHasher<User>();

        var user = new User
        {
            Name = userDto.Name,
            Email = userDto.Email,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = passwordHasher.HashPassword(
            user,
            userDto.Password
        );

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetUsers),
            new { id = user.Id },
            new
            {
                user.Id,
                user.Name,
                user.Email,
                user.CreatedAt
            }
        );
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login(LoginUserDto loginDto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(user => user.Email == loginDto.Email);

        if (user == null)
        {
            return Unauthorized(new { message = "Email ou senha incorretos." });
        }

        var passwordHasher = new PasswordHasher<User>();

        var result = passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            loginDto.Password
        );

        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new { message = "Email ou senha incorretos." });
        }

        return Ok(new
        {
            user.Id,
            user.Name,
            user.Email,
            user.CreatedAt
        });
    }
}