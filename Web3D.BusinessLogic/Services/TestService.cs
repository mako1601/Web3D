using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.DataAccess.Abstractions;
using Web3D.BusinessLogic.Abstractions;

namespace Web3D.BusinessLogic.Services;

internal class TestService(
    ITestRepository testRepository,
    ITestResultRepository testResultRepository,
    IAnswerResultRepository answerResultRepository)
    : ITestService
{
    public async Task CreateAsync(long userId, string title, string description, ICollection<Question> questions, CancellationToken cancellationToken = default)
    {
        var test = new Test
        {
            UserId = userId,
            Title = title,
            Description = description,
            Questions = questions,
            CreatedAt = DateTime.UtcNow,
        };

        await testRepository.CreateAsync(test, cancellationToken);
    }

    public async Task<Test?> GetByIdAsync(long testId, CancellationToken cancellationToken = default)
    {
        var test = await testRepository.GetByIdAsync(testId, cancellationToken) ?? throw new Exception("Test was not found");
        return test;
    }

    public async Task<PageResult<Test>> GetAllAsync(Filter filter, SortParams sortParams, PageParams pageParams, CancellationToken cancellationToken = default)
    {
        var tests = await testRepository.GetAllAsync(filter, sortParams, pageParams, cancellationToken);
        return tests;
    }

    public async Task UpdateAsync(long testId, string newTitle, string newDescription, ICollection<Question> questions, CancellationToken cancellationToken = default)
    {
        var test = await testRepository.GetByIdAsync(testId, cancellationToken) ?? throw new Exception("Test was not found");

        test.Title = newTitle;
        test.Description = newDescription;
        test.Questions = questions;
        test.UpdatedAt = DateTime.UtcNow;

        await testRepository.UpdateAsync(test, cancellationToken);
    }

    public async Task DeleteAsync(long testId, CancellationToken cancellationToken = default)
    {
        var test = await testRepository.GetByIdAsync(testId, cancellationToken) ?? throw new Exception("Test was not found");
        await testRepository.DeleteAsync(test, cancellationToken);
    }

    public async Task<long> StartTestAsync(long testId, long userId, CancellationToken cancellationToken = default)
    {
        _ = await testRepository.GetByIdAsync(testId, cancellationToken) ?? throw new Exception("Test was not found");
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
        var testResult = await testResultRepository.GetTestResultByIdAsync(testResultId, cancellationToken) ?? throw new Exception("TestResult was not found");
        return testResult;
    }
}
