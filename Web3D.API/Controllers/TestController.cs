using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using Web3D.API.Requests;
using Web3D.BusinessLogic.Abstractions;

namespace Web3D.API.Controllers;

[ApiController]
[Route("api/tests")]
public class TestController(ITestService testService) : ControllerBase
{
    [Authorize(Roles = "Teacher")]
    [HttpPost]
    public async Task<IActionResult> CreateAsync([FromBody] string title)
    {
        var userId = User.FindFirstValue("id");
        if (!long.TryParse(userId, out var parsedUserId)) return Forbid();

        await testService.CreateAsync(parsedUserId, title);
        return NoContent();
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetAsync([FromRoute] long id)
    {
        var result = await testService.GetByIdAsync(id);
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllAsync()
    {
        var result = await testService.GetAllAsync();
        return Ok(result);
    }

    [Authorize(Roles = "Teacher")]
    [HttpPut("{testId:long}")]
    public async Task<IActionResult> UpdateAsync([FromRoute] long testId, [FromBody] TestRequest request)
    {
        var userId = User.FindFirstValue("id");
        if (!long.TryParse(userId, out var parsedUserId)) return Forbid();

        await testService.UpdateAsync(testId, parsedUserId, request.Title, request.Questions);
        return NoContent();
    }

    [Authorize(Roles = "Teacher")]
    [HttpDelete("{testId:long}")]
    public async Task<IActionResult> DeleteAsync([FromRoute] long testId)
    {
        var userId = User.FindFirstValue("id");
        if (!long.TryParse(userId, out var parsedUserId)) return Forbid();

        await testService.DeleteAsync(testId, parsedUserId);
        return NoContent();
    }

    [Authorize]
    [HttpPost("{testId:long}/start")]
    public async Task<IActionResult> StartTestAsync([FromRoute] long testId)
    {
        var userId = User.FindFirstValue("id");
        if (!long.TryParse(userId, out var parsedUserId)) return Forbid();

        var testResultId = await testService.StartTestAsync(testId, parsedUserId);
        return Ok(testResultId);
    }

    [Authorize]
    [HttpPut("{testResultId:long}/finish")]
    public async Task<IActionResult> FinishTestAsync([FromRoute] long testResultId)
    {
        await testService.FinishTestAsync(testResultId);
        return NoContent();
    }
    
    [Authorize]
    [HttpPost("{testResultId:long}/answer")]
    public async Task<IActionResult> SubmitAnswerAsync([FromRoute] long testResultId, [FromBody] AnswerRequest request)
    {
        await testService.SaveAnswerAsync(testResultId, request.QuestionId, request.AnswerOptionId);
        return NoContent();
    }
    
    [Authorize]
    [HttpGet("{testResultId:long}/result")]
    public async Task<IActionResult> GetTestResultAsync([FromRoute] long testResultId)
    {
        var result = await testService.GetTestResultByIdAsync(testResultId);
        return Ok(result);
    }
}
