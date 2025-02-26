using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using Web3D.API.Requests;
using Web3D.Domain.Filters;
using Web3D.BusinessLogic.Abstractions;

namespace Web3D.API.Controllers;

[ApiController]
[Route("api/articles")]
public class ArticleController(IArticleService articleService) : ControllerBase
{
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateAsync([FromBody] ArticleCreateRequest request)
    {
        var authorId = Convert.ToInt64(User.Claims.FirstOrDefault(x => x.Type == "id")?.Value);

        await articleService.CreateAsync(authorId, request.Title, request.Description, request.Content);
        return NoContent();
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetAsync([FromRoute] long id)
    {
        var result = await articleService.GetByIdAsync(id);
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllAsync([FromQuery] ArticleFilter sort, [FromQuery] SortParams order, [FromQuery] PageParams page)
    {
        var result = await articleService.GetAllAsync(sort, order, page);
        return Ok(result);
    }

    [Authorize]
    [HttpPut("{id:long}")]
    public async Task<IActionResult> UpdateAsync([FromRoute] long id, [FromBody] ArticleRequest request)
    {
        await articleService.UpdateAsync(id, request.Title, request.Description, request.Content);
        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteAsync([FromRoute] long id)
    {
        await articleService.DeleteAsync(id);
        return NoContent();
    }
}