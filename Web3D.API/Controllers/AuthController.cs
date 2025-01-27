using Microsoft.AspNetCore.Mvc;

using Web3D.API.Requests;
using Web3D.BusinessLogic.Abstractions;

namespace Web3D.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IUserService userService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> RegisterAsync([FromBody] RegisterRequest request)
    {
        await userService.RegisterAsync(request.Login, request.Password, request.LastName, request.FirstName, request.MiddleName, request.Role);
        return NoContent();
    }

    [HttpGet("login")]
    public async Task<IActionResult> LoginAsync([FromBody] LoginRequest request)
    {
        var token = await userService.LoginAsync(request.Login, request.Password);
        return Ok(token);
    }
}
