using Microsoft.AspNetCore.Mvc;

using Web3D.API.Requests;
using Web3D.BusinessLogic.Abstractions;

namespace Web3D.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IUserService userService) : ControllerBase
{
    private readonly CookieOptions _accessTokenCookieOptions = new()
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Expires = DateTime.UtcNow.AddMinutes(10),
    };

    private readonly CookieOptions _refreshToken = new()
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Expires = DateTime.UtcNow.AddDays(7),
    };

    [HttpPost("register")]
    public async Task<IActionResult> RegisterAsync([FromBody] RegisterRequest request)
    {
        var result = await userService.RegisterAsync(request.Login, request.Password, request.LastName, request.FirstName, request.MiddleName, request.Role);

        Response.Cookies.Append("accessToken", result.Item1, _accessTokenCookieOptions);
        Response.Cookies.Append("refreshToken", result.Item2, _refreshToken);

        return Ok();
    }

    [HttpPost("login")]
    public async Task<IActionResult> LoginAsync([FromBody] LoginRequest request)
    {
        var result = await userService.LoginAsync(request.Login, request.Password);

        Response.Cookies.Append("accessToken", result.Item1, _accessTokenCookieOptions);
        Response.Cookies.Append("refreshToken", result.Item2, _refreshToken);

        return Ok();
    }

    //[HttpGet("check")]
    //public IActionResult CheckAuth()
    //{
    //    var accessToken = Request.Cookies["accessToken"];
    //    return accessToken == null ? Unauthorized() : Ok();
    //}

    [HttpPost("logout")]
    public IActionResult LogoutAsync()
    {
        Response.Cookies.Delete("accessToken");
        Response.Cookies.Delete("refreshToken");

        return Ok();
    }

    [HttpPost("refresh_accesstoken")]
    public async Task<IActionResult> RefreshAccessToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (refreshToken == null) return Unauthorized("Refresh token not found");

        var newAccessToken = await userService.RefreshAccessTokenAsync(refreshToken);

        Response.Cookies.Append("accessToken", newAccessToken, _accessTokenCookieOptions);

        return Ok();
    }
}
