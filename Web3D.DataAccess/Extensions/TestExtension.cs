using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.DataAccess.Contexts;

namespace Web3D.DataAccess.Extensions;

public static class TestExtension
{
    public static IQueryable<Test> Filter(this IQueryable<Test> query, Filter filter, Web3DDbContext context)
    {
        if (!string.IsNullOrWhiteSpace(filter.SearchText))
        {
            var searchText = filter.SearchText.Trim();
            var keywords = searchText.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                                     .Select(x => x.ToLower())
                                     .ToList();

            query = query
                .Join(
                    context.Users,
                    test => test.UserId,
                    user => user.Id,
                    (test, user) => new { test, user }
                )
                .Where(x => keywords.All(y =>
                    x.test.Title.ToLower().Contains(y) ||
                    x.test.Description.ToLower().Contains(y) ||
                    string.Join(" ", x.user.LastName, x.user.FirstName, x.user.MiddleName)
                        .ToLower()
                        .Contains(y)
                ))
                .Select(x => x.test);
        }

        return query;
    }

    public static IQueryable<Test> Sort(this IQueryable<Test> query, SortParams sortParams, Web3DDbContext context)
    {
        return sortParams.SortDirection == SortDirection.Descending
            ? query.OrderByDescending(GetKeySelector(sortParams.OrderBy, context))
            : query.OrderBy(GetKeySelector(sortParams.OrderBy, context));
    }

    public static async Task<PageResult<Test>> ToPagedAsync(this IQueryable<Test> query, PageParams pageParams, CancellationToken cancellationToken = default)
    {
        var count = await query.CountAsync(cancellationToken);

        if (count <= 0) return new PageResult<Test>([], 0);

        var page = pageParams.CurrentPage ?? 1;
        var pageSize = pageParams.PageSize ?? 10;

        var result = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToArrayAsync(cancellationToken);

        return new PageResult<Test>(result, count);
    }

    private static Expression<Func<Test, object>> GetKeySelector(string? orderBy, Web3DDbContext context)
    {
        if (string.IsNullOrEmpty(orderBy)) return x => x.Title;

        return orderBy switch
        {
            nameof(Test.CreatedAt) => x => x.CreatedAt,
            nameof(Test.UpdatedAt) => x => x.UpdatedAt ?? x.CreatedAt,
            nameof(Test.UserId) => x =>
                context.Users
                    .Where(y => y.Id == x.UserId)
                    .Select(y => y.MiddleName == null ? y.LastName + " " + y.FirstName : y.LastName + " " + y.FirstName + " " + y.MiddleName)
                    .FirstOrDefault() ?? string.Empty,
            _ => x => x.Title
        };
    }
}
