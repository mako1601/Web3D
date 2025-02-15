using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.DataAccess.Abstractions;
using Web3D.BusinessLogic.Abstractions;

namespace Web3D.BusinessLogic.Services;

internal class ArticleService(IArticleRepository articleRepository) : IArticleService
{
    public async Task CreateAsync(long authorId, string title, CancellationToken cancellationToken = default)
    {
        var article = new Article()
        {
            Title = title,
            UserId = authorId,
            CreatedAt = DateTime.UtcNow,
        };

        await articleRepository.CreateAsync(article, cancellationToken);
    }

    public async Task<Article?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var article = await articleRepository.GetByIdAsync(id, cancellationToken)
                   ?? throw new Exception("Article was not found");

        return article;
    }

    public async Task<PageResult<Article>> GetAllAsync(ArticleFilter articleFilter, SortParams sortParams, PageParams pageParams, CancellationToken cancellationToken = default)
    {
        var articles = await articleRepository.GetAllAsync(articleFilter, sortParams, pageParams, cancellationToken);

        return articles;
    }

    public async Task UpdateAsync(long id, string title, string description, string content, CancellationToken cancellationToken = default)
    {
        var article = await articleRepository.GetByIdAsync(id, cancellationToken)
                      ?? throw new Exception("Article was not found");

        article.Title = title;
        article.Description = description;
        article.Content = content;
        article.UpdatedAt = DateTime.UtcNow;

        await articleRepository.UpdateAsync(article, cancellationToken);
    }

    public async Task DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var article = await articleRepository.GetByIdAsync(id, cancellationToken)
                      ?? throw new Exception("Article was not found");

        await articleRepository.DeleteAsync(article, cancellationToken);
    }
}