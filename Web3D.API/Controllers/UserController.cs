using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using Web3D.API.Requests;
using Web3D.Domain.Filters;
using Web3D.BusinessLogic.Abstractions;
using Web3D.Domain.Models;
using Web3D.Domain.Exceptions;

namespace Web3D.API.Controllers;

[ApiController]
[Route("api/users")]
public class UserController(IUserService userService) : ControllerBase
{
    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser()
    {
        var user = new
        {
            id = User.Claims.FirstOrDefault(x => x.Type == "id")?.Value,
            lastName = User.Claims.FirstOrDefault(x => x.Type == "lastName")?.Value,
            firstName = User.Claims.FirstOrDefault(x => x.Type == "firstName")?.Value,
            middleName = User.Claims.FirstOrDefault(x => x.Type == "middleName")?.Value,
            role = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Role)?.Value
        };

        return Ok(user);
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetAsync([FromRoute] long id)
    {
        var result = await userService.GetByIdAsync(id);
        return Ok(result);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllAsync([FromQuery] UserFilter sort, [FromQuery] PageParams page, [FromQuery] SortParams order)
    {
        var result = await userService.GetAllAsync(sort, order, page);
        return Ok(result);
    }

    [HttpPut("{id:long}")]
    [Authorize]
    public async Task<IActionResult> UpdateAsync([FromRoute] long id, [FromBody] UpdateUserNameRequest request)
    {
        await userService.UpdateAsync(id, request.LastName, request.FirstName, request.MiddleName);
        return NoContent();
    }

    //[Authorize]
    //[HttpDelete("{id:long}")]
    //public async Task<IActionResult> DeleteAsync([FromRoute] long id)
    //{
    //    await userService.DeleteAsync(id);
    //    return NoContent();
    //}

    [HttpPut("{id:long}/update-password")]
    [Authorize]
    public async Task<IActionResult> UpdatePasswordAsync([FromRoute] long id, [FromBody] UpdateUserPasswordRequest request)
    {
        await userService.UpdatePasswordAsync(id, request.OldPassword, request.NewPassword, request.ConfirmPassword);
        return NoContent();
    }

    [HttpPut("{id:long}/change-role")]
    [Authorize]
    public async Task<IActionResult> ChangeRoleAsync([FromRoute] long id, [FromBody] ChangeRoleRequest request)
    {
        try
        {
            var callerId = Convert.ToInt64(User.Claims.FirstOrDefault(x => x.Type == "id")?.Value);
            await userService.UpdateRoleAsync(callerId, id, request.NewRole);
            return NoContent();
        }
        catch (UserNotFoundException)
        {
            return NotFound("Пользователь не найден");
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка на сервере: " + ex.Message);
        }
    }
}
