using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using Web3D.API.Requests;
using Web3D.Domain.Filters;
using Web3D.BusinessLogic.Abstractions;

namespace Web3D.API.Controllers;

[ApiController]
[Route("api/users")]
public class UserController(IUserService userService) : ControllerBase
{
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetAsync([FromRoute] long id)
    {
        var result = await userService.GetByIdAsync(id);
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllAsync([FromQuery] UserFilter sort, [FromQuery] PageParams page, [FromQuery] SortParams order)
    {
        if (page.CurrentPage <= 0 || page.PageSize <= 0) return BadRequest("Invalid pagination parameters");

        var result = await userService.GetAllAsync(sort, order, page);
        return Ok(result);
    }

    [Authorize]
    [HttpPut("{id:long}")]
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

    [Authorize]
    [HttpPut("{id:long}/update_password")]
    public async Task<IActionResult> UpdatePasswordAsync([FromRoute] long id, [FromBody] UpdateUserPasswordRequest request)
    {
        await userService.UpdatePasswordAsync(id, request.OldPassword, request.NewPassword, request.ConfirmPassword);
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:long}/change_role")]
    public async Task<IActionResult> ChangeRoleAsync([FromRoute] long id, [FromBody] UpdateRoleRequest request)
    {
        await userService.UpdateRoleAsync(id, request.UserId, request.NewRole);
        return NoContent();
    }
}
