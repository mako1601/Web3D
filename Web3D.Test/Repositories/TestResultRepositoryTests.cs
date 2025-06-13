using Microsoft.EntityFrameworkCore;
using Web3D.DataAccess.Contexts;
using Web3D.DataAccess.Repositories;
using Web3D.Domain.Filters;
using Web3D.Domain.Models;
using Xunit;

namespace Web3D.Test.Repositories;

public class TestResultRepositoryTests
{
    private static Web3DDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<Web3DDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new Web3DDbContext(options);
    }

    [Fact]
    public async Task StartTestAsync_ShouldAddTestResultAndReturnId()
    {
        var context = CreateContext();
        var repo = new TestResultRepository(context);

        var testResult = new TestResult
        {
            UserId = 1,
            TestId = 2,
            Attempt = 1,
            StartedAt = DateTime.UtcNow
        };

        var resultId = await repo.StartTestAsync(testResult);

        Assert.True(resultId > 0);
        Assert.Single(context.TestResults);
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateTestResult()
    {
        var context = CreateContext();
        var testResult = new TestResult
        {
            Id = 1,
            UserId = 1,
            TestId = 2,
            Attempt = 1,
            StartedAt = DateTime.UtcNow
        };

        await context.TestResults.AddAsync(testResult);
        await context.SaveChangesAsync();

        var repo = new TestResultRepository(context);
        testResult.Score = 88.8;
        testResult.EndedAt = DateTime.UtcNow;

        await repo.UpdateAsync(testResult);

        var updated = await context.TestResults.FindAsync(1L);
        Assert.Equal(88.8, updated!.Score);
        Assert.NotNull(updated.EndedAt);
    }

    [Fact]
    public async Task GetTestResultByIdAsync_ShouldReturnResult()
    {
        var context = CreateContext();
        var testResult = new TestResult { Id = 1, UserId = 1, TestId = 2, Attempt = 1 };
        await context.TestResults.AddAsync(testResult);
        await context.SaveChangesAsync();

        var repo = new TestResultRepository(context);
        var result = await repo.GetTestResultByIdAsync(1L);

        Assert.NotNull(result);
        Assert.Equal(1, result!.Attempt);
    }

    [Fact]
    public async Task GetTestResultByIdAsync_ShouldReturnNullIfNotFound()
    {
        var context = CreateContext();
        var repo = new TestResultRepository(context);

        var result = await repo.GetTestResultByIdAsync(12345);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetAttemptAsync_ShouldReturn1IfNoPreviousAttempts()
    {
        var context = CreateContext();
        var repo = new TestResultRepository(context);

        var nextAttempt = await repo.GetAttemptAsync(testId: 1, userId: 1);

        Assert.Equal(1, nextAttempt);
    }

    [Fact]
    public async Task GetAttemptAsync_ShouldReturnNextAttemptNumber()
    {
        var context = CreateContext();
        context.TestResults.AddRange(
            new TestResult { TestId = 1, UserId = 1, Attempt = 1 },
            new TestResult { TestId = 1, UserId = 1, Attempt = 2 },
            new TestResult { TestId = 1, UserId = 1, Attempt = 3 }
        );
        await context.SaveChangesAsync();

        var repo = new TestResultRepository(context);
        var nextAttempt = await repo.GetAttemptAsync(1, 1);

        Assert.Equal(4, nextAttempt);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnPagedResults()
    {
        var context = CreateContext();
        for (int i = 1; i <= 12; i++)
        {
            context.TestResults.Add(new TestResult
            {
                UserId = i % 2 + 1,
                TestId = i % 3 + 1,
                Attempt = 1,
                StartedAt = DateTime.UtcNow.AddMinutes(-i)
            });
        }
        await context.SaveChangesAsync();

        var repo = new TestResultRepository(context);
        var pageParams = new PageParams { CurrentPage = 2, PageSize = 5 };
        var result = await repo.GetAllAsync(new Filter(), new SortParams(), pageParams);

        Assert.Equal(5, result.Data.Length);
        Assert.Equal(12, result.TotalCount);
    }
}
