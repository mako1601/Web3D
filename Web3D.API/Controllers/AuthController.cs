using Microsoft.AspNetCore.Mvc;

using Web3D.API.Requests;
using Web3D.Domain.Exceptions;
using Web3D.BusinessLogic.Abstractions;
using Microsoft.AspNetCore.Authorization;

namespace Web3D.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IUserService userService, ITokenService tokenService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> RegisterAsync([FromBody] RegisterRequest request)
    {
        try
        {
            var (accessToken, refreshToken) = await userService.RegisterAsync(request.Login, request.Password, request.LastName, request.FirstName, request.MiddleName, request.Role);

            Response.Cookies.Append("accessToken", accessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddMinutes(10),
            });
            Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7),
            });

            return Ok();
        }
        catch (LoginAlreadyTakenException)
        {
            return Conflict("Логин уже занят");
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка на сервере: " + ex.Message);
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> LoginAsync([FromBody] LoginRequest request)
    {
        try
        {
            var (accessToken, refreshToken) = await userService.LoginAsync(request.Login, request.Password);

            Response.Cookies.Append("accessToken", accessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddMinutes(10),
            });
            Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7),
            });

            return Ok();
        }
        catch (InvalidLoginOrPasswordException)
        {
            return NotFound("Неверный логин или пароль");
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка на сервере: " + ex.Message);
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> LogoutAsync()
    {
        var token = Request.Cookies["refreshToken"];
        if (token == null) return NotFound("Refresh token not found");

        await tokenService.DeleteAsync(token);

        Response.Cookies.Delete("accessToken");
        Response.Cookies.Delete("refreshToken");

        return Ok();
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshAccessToken()
    {
        var token = Request.Cookies["refreshToken"];
        if (token == null) return Unauthorized("Refresh token not found");

        var refreshToken = await tokenService.UpdateByTokenAsync(token);
        if (refreshToken == null) return NotFound("Refresh token not found");

        var newAccessToken = await userService.RefreshAccessTokenAsync(refreshToken.UserId);
        if (newAccessToken == null) return NotFound("Access token was not generated");

        Response.Cookies.Append("accessToken", newAccessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddMinutes(10),
        });
        Response.Cookies.Append("refreshToken", refreshToken.Token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7),
        });

        return Ok();
    }
}
