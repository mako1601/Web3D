using Microsoft.EntityFrameworkCore;

using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.DataAccess.Contexts;
using Web3D.DataAccess.Abstractions;
using Web3D.DataAccess.Extensions;

namespace Web3D.DataAccess.Repositories;

internal class TestRepository(Web3DDbContext context) : ITestRepository
{
    public async Task CreateAsync(Test test, CancellationToken cancellationToken = default)
    {
        var user = await context.Users.FirstOrDefaultAsync(x => x.Id == test.UserId, cancellationToken: cancellationToken) ?? throw new Exception("User was not found");
        user.LastActivity = DateTime.UtcNow;

        await context.Tests.AddAsync(test, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<Test?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await context.Tests
            .Include(x => x.Questions)
            .ThenInclude(x => x.AnswerOptions)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken: cancellationToken);
    }

    public async Task<PageResult<Test>> GetAllAsync(Filter filter, SortParams sortParams, PageParams pageParams, CancellationToken cancellationToken = default)
    {
        return await context.Tests
            .Include(x => x.Questions)
            .Filter(filter, context)
            .Sort(sortParams, context)
            .ToPagedAsync(pageParams, cancellationToken);
    }

    public async Task UpdateAsync(Test test, CancellationToken cancellationToken = default)
    {
        var user = await context.Users.FirstOrDefaultAsync(x => x.Id == test.UserId, cancellationToken: cancellationToken) ?? throw new Exception("User was not found");
        user.LastActivity = DateTime.UtcNow;

        context.Tests.Update(test);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Test test, CancellationToken cancellationToken = default)
    {
        var user = await context.Users.FirstOrDefaultAsync(x => x.Id == test.UserId, cancellationToken: cancellationToken) ?? throw new Exception("User was not found");
        user.LastActivity = DateTime.UtcNow;

        context.Tests.Remove(test);
        await context.SaveChangesAsync(cancellationToken);
    }
}
