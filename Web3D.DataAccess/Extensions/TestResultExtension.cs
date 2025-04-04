using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.DataAccess.Contexts;

namespace Web3D.DataAccess.Extensions;

public static class TestResultExtension
{
    public static IQueryable<TestResult> Filter(this IQueryable<TestResult> query, Filter filter, Web3DDbContext context)
    {
        if (filter.TestId is not null)
        {
            query = query.Where(x => x.TestId == filter.TestId);
        }

        return query;
    }

    public static IQueryable<TestResult> Sort(this IQueryable<TestResult> query, SortParams sortParams, Web3DDbContext context)
    {
        return sortParams.SortDirection == SortDirection.Descending
            ? query.OrderByDescending(GetKeySelector(sortParams.OrderBy, context))
            : query.OrderBy(GetKeySelector(sortParams.OrderBy, context));
    }

    public static async Task<PageResult<TestResult>> ToPagedAsync(this IQueryable<TestResult> query, PageParams pageParams, CancellationToken cancellationToken = default)
    {
        var count = await query.CountAsync(cancellationToken);

        if (count <= 0) return new PageResult<TestResult>([], 0);

        var page = pageParams.CurrentPage ?? 1;
        var pageSize = pageParams.PageSize ?? count;

        var result = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToArrayAsync(cancellationToken);

        return new PageResult<TestResult>(result, count);
    }

    private static Expression<Func<TestResult, object>> GetKeySelector(string? orderBy, Web3DDbContext context)
    {
        if (string.IsNullOrEmpty(orderBy)) return x => x.StartedAt;

        return orderBy switch
        {
            nameof(TestResult.StartedAt) => x => x.StartedAt,
            nameof(TestResult.EndedAt) => x => x.EndedAt ?? x.StartedAt,
            nameof(TestResult.UserId) => x =>
                context.Users
                    .Where(y => y.Id == x.UserId)
                    .Select(y => y.MiddleName == null ? y.LastName + " " + y.FirstName : y.LastName + " " + y.FirstName + " " + y.MiddleName)
                    .FirstOrDefault() ?? string.Empty,
            nameof(TestResult.TestId) => x => x.TestId,
            nameof(TestResult.Score) => x => x.Score ?? 0,
            _ => x => x.StartedAt
        };
    }
}
