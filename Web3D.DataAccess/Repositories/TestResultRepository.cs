using Microsoft.EntityFrameworkCore;

using Web3D.Domain.Models;
using Web3D.DataAccess.Contexts;
using Web3D.DataAccess.Abstractions;

namespace Web3D.DataAccess.Repositories;

internal class TestResultRepository(Web3DDbContext context) : ITestResultRepository
{
    public async Task<long> StartTestAsync(TestResult testResult, CancellationToken cancellationToken = default)
    {
        await context.TestResults.AddAsync(testResult, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        return testResult.Id;
    }

    public async Task FinishTestAsync(long testResultId, CancellationToken cancellationToken = default)
    {
        var testResult = await context.TestResults.FirstOrDefaultAsync(x => x.Id == testResultId, cancellationToken: cancellationToken)
                         ?? throw new Exception("TestResult was not found");

        testResult.EndedAt = DateTime.UtcNow;
        testResult.Score = await context.AnswerResults
            .Where(x => x.TestResultId == testResultId && x.IsCorrect)
            .CountAsync(cancellationToken);

        await context.SaveChangesAsync(cancellationToken);
    }
    public async Task<TestResult?> GetTestResultByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await context.TestResults
            .Include(x => x.AnswerResults)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken: cancellationToken);
    }

    public async Task<long> GetAttemptAsync(long testId, long userId, CancellationToken cancellationToken = default)
    {
        var testResult = await context.TestResults
            .Where(x => x.TestId == testId && x.UserId == userId)
            .FirstOrDefaultAsync(cancellationToken: cancellationToken);

        return testResult is null ? 1 : await context.TestResults
            .Where(x => x.TestId == testId && x.UserId == userId)
            .MaxAsync(x => x.Attempt + 1, cancellationToken);
    }
}
