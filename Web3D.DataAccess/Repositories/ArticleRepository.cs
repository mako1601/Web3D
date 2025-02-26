using Microsoft.EntityFrameworkCore;

using Web3D.Domain;
using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.DataAccess.Contexts;
using Web3D.DataAccess.Extensions;
using Web3D.DataAccess.Abstractions;

namespace Web3D.DataAccess.Repositories;

internal class ArticleRepository(Web3DDbContext context) : IArticleRepository
{
    public async Task CreateAsync(Article article, CancellationToken cancellationToken = default)
    {
        await context.Articles.AddAsync(article, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<Article?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await context.Articles.FirstOrDefaultAsync(x => x.Id == id, cancellationToken: cancellationToken);
    }

    public async Task<PageResult<Article>> GetAllAsync(ArticleFilter articleFilter, SortParams sortParams, PageParams pageParams, CancellationToken cancellationToken = default)
    {
        return await context.Articles
            .Filter(articleFilter, context)
            .Sort(sortParams, context)
            .ToPagedAsync(pageParams, cancellationToken);
    }

    public async Task UpdateAsync(Article article, CancellationToken cancellationToken = default)
    {
        context.Articles.Update(article);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Article article, CancellationToken cancellationToken = default)
    {
        context.Articles.Remove(article);
        await context.SaveChangesAsync(cancellationToken);
    }
}
