using Web3D.Domain.Models;
using Web3D.DataAccess.Abstractions;
using Web3D.BusinessLogic.Abstractions;

namespace Web3D.BusinessLogic.Services;

internal class TestService(
    ITestRepository testRepository,
    ITestResultRepository testResultRepository,
    IAnswerResultRepository answerResultRepository)
    : ITestService
{
    public async Task CreateAsync(long userId, string title, CancellationToken cancellationToken = default)
    {
        var test = new Test
        {
            Title = title,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
        };

        await testRepository.CreateAsync(test, cancellationToken);
    }

    public async Task<Test?> GetByIdAsync(long testId, CancellationToken cancellationToken = default)
    {
        var test = await testRepository.GetByIdAsync(testId, cancellationToken)
                   ?? throw new Exception("Test was not found");

        return test;
    }

    public async Task<List<Test>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var tests = await testRepository.GetAllAsync(cancellationToken);

        return tests;
    }

    public async Task UpdateAsync(long testId, long userId, string newTitle, ICollection<Question> questions, CancellationToken cancellationToken = default)
    {
        var test = await testRepository.GetByIdAsync(testId, cancellationToken)
                   ?? throw new Exception("Test was not found");

        if (test.UserId != userId) throw new Exception("Test can only be changed by the author");

        test.Title = newTitle;
        test.Questions = questions;
        test.UpdatedAt = DateTime.UtcNow;

        await testRepository.UpdateAsync(test, cancellationToken);
    }

    public async Task DeleteAsync(long testId, long userId, CancellationToken cancellationToken = default)
    {
        var test = await testRepository.GetByIdAsync(testId, cancellationToken)
                   ?? throw new Exception("Test was not found");

        if (test.UserId != userId) throw new Exception("Test can only be deleted by the author");

        await testRepository.DeleteAsync(test, cancellationToken);
    }

    public async Task<long> StartTestAsync(long testId, long userId, CancellationToken cancellationToken = default)
    {
        _ = await testRepository.GetByIdAsync(testId, cancellationToken)
            ?? throw new Exception("Test was not found");
        var attempt = await testResultRepository.GetAttemptAsync(testId, userId, cancellationToken);

        var testResult = new TestResult
        {
            UserId = userId,
            TestId = testId,
            Attempt = attempt,
            StartedAt = DateTime.UtcNow,
        };

        var testResultId = await testResultRepository.StartTestAsync(testResult, cancellationToken);
        return testResultId;
    }

    public async Task FinishTestAsync(long testResultId, CancellationToken cancellationToken = default)
    {
        await testResultRepository.FinishTestAsync(testResultId, cancellationToken);
    }

    public async Task SaveAnswerAsync(long testResultId, long questionId, long? answerOptionId, CancellationToken cancellationToken = default)
    {
        var isCorrect = await answerResultRepository.IsAnswerCorrectAsync(questionId, answerOptionId, cancellationToken);
        
        var answerResult = new AnswerResult
        {
            TestResultId = testResultId,
            QuestionId = questionId,
            AnswerOptionId = answerOptionId,
            IsCorrect = isCorrect,
        };

        await answerResultRepository.SaveAnswerAsync(answerResult, cancellationToken);
    }

    public async Task<TestResult?> GetTestResultByIdAsync(long testResultId, CancellationToken cancellationToken = default)
    {
        var testResult = await testResultRepository.GetTestResultByIdAsync(testResultId, cancellationToken)
                         ?? throw new Exception("TestResult was not found");

        return testResult;
    }
}
