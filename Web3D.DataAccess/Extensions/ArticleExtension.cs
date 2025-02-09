using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

using Web3D.Domain;
using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.DataAccess.Contexts;

namespace Web3D.DataAccess.Extensions;

public static class ArticleExtension
{
    public static IQueryable<Article> Filter(this IQueryable<Article> query, ArticleFilter articleFilter)
    {
        if (!string.IsNullOrEmpty(articleFilter.Title))
        {
            query = query.Where(x => x.Title.Contains(articleFilter.Title));
        }

        if (!string.IsNullOrEmpty(articleFilter.Description))
        {
            query = query.Where(x => x.Description.Contains(articleFilter.Description));
        }

        return query;
    }

    public static IQueryable<Article> Sort(this IQueryable<Article> query, SortParams sortParams, Web3DDbContext context)
    {
        return sortParams.SortDirection == SortDirection.Descending
            ? query.OrderByDescending(GetKeySelector(sortParams.OrderBy, context))
            : query.OrderBy(GetKeySelector(sortParams.OrderBy, context));
    }

    public static async Task<PageResult<Article>> ToPagedAsync(this IQueryable<Article> query, PageParams pageParams, CancellationToken cancellationToken = default)
    {
        var count = await query.CountAsync(cancellationToken);

        if (count <= 0) return new PageResult<Article>([], 0);

        var page = pageParams.CurrentPage ?? 1;
        var pageSize = pageParams.PageSize ?? 10;

        var result = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToArrayAsync(cancellationToken);

        return new PageResult<Article>(result, count);
    }

    private static Expression<Func<Article, object>> GetKeySelector(string? orderBy, Web3DDbContext context)
    {
        if (string.IsNullOrEmpty(orderBy)) return x => x.Title;

        return orderBy switch
        {
            nameof(Article.CreatedAt) => x => x.CreatedAt,
            nameof(Article.UpdatedAt) => x => x.UpdatedAt ?? x.CreatedAt,
            nameof(Article.UserId) => x =>
                context.Users
                    .Where(y => y.Id == x.UserId)
                    .Select(y => y.MiddleName == null ? y.LastName + " " + y.FirstName : y.LastName + " " + y.FirstName + " " + y.MiddleName)
                    .FirstOrDefault() ?? string.Empty,
            _ => x => x.Title
        };
    }
}
