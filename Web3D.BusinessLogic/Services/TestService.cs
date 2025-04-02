using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.Domain.Exceptions;
using Web3D.DataAccess.Abstractions;
using Web3D.BusinessLogic.Abstractions;

namespace Web3D.BusinessLogic.Services;

internal class TestService(
    IUserRepository userRepository,
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
            CreatedAt = DateTime.UtcNow
        };

        await testRepository.CreateAsync(test, cancellationToken);
    }

    public async Task<Test?> GetByIdAsync(long testId, CancellationToken cancellationToken = default)
    {
        var test = await testRepository.GetByIdAsync(testId, cancellationToken) ?? throw new TestNotFoundException();
        return test;
    }

    public async Task<Test?> GetForPassingByIdAsync(long testId, CancellationToken cancellationToken = default)
    {
        var test = await testRepository.GetByIdAsync(testId, cancellationToken) ?? throw new TestNotFoundException();

        foreach (var question in test.Questions)
        {
            switch (question.Type)
            {
                case QuestionType.SingleChoice:
                case QuestionType.MultipleChoice:
                    foreach (var answer in question.AnswerOptions)
                    {
                        answer.IsCorrect = false;
                    }
                    break;

                case QuestionType.Matching:
                    var shuffledPairs = question.AnswerOptions
                        .Select(a => a.MatchingPair)
                        .OrderBy(_ => Guid.NewGuid())
                        .ToList();

                    int index = 0;
                    foreach (var answer in question.AnswerOptions)
                    {
                        answer.MatchingPair = shuffledPairs[index++];
                    }
                    break;

                case QuestionType.FillInTheBlank:
                    question.CorrectAnswer = null;
                    break;
            }
        }

        return test;
    }

    public async Task<PageResult<Test>> GetAllAsync(Filter filter, SortParams sortParams, PageParams pageParams, CancellationToken cancellationToken = default)
    {
        var tests = await testRepository.GetAllAsync(filter, sortParams, pageParams, cancellationToken);
        return tests;
    }

    public async Task UpdateAsync(long testId, string newTitle, string newDescription, ICollection<Question> questions, CancellationToken cancellationToken = default)
    {
        var test = await testRepository.GetByIdAsync(testId, cancellationToken) ?? throw new TestNotFoundException();

        test.Title = newTitle;
        test.Description = newDescription;
        test.Questions = questions;
        test.UpdatedAt = DateTime.UtcNow;

        await testRepository.UpdateAsync(test, cancellationToken);
    }

    public async Task DeleteAsync(long testId, CancellationToken cancellationToken = default)
    {
        var test = await testRepository.GetByIdAsync(testId, cancellationToken) ?? throw new TestNotFoundException();
        await testRepository.DeleteAsync(test, cancellationToken);
    }

    public async Task<long> StartTestAsync(long testId, long userId, CancellationToken cancellationToken = default)
    {
        _ = await testRepository.GetByIdAsync(testId, cancellationToken) ?? throw new TestNotFoundException();
        _ = await userRepository.GetByIdAsync(userId, cancellationToken) ?? throw new UserNotFoundException();
        var attempt = await testResultRepository.GetAttemptAsync(testId, userId, cancellationToken);

        var testResult = new TestResult
        {
            UserId = userId,
            TestId = testId,
            Attempt = attempt,
            StartedAt = DateTime.UtcNow
        };

        var testResultId = await testResultRepository.StartTestAsync(testResult, cancellationToken);
        return testResultId;
    }

    public async Task FinishTestAsync(long testResultId, ICollection<Question> questions, CancellationToken cancellationToken = default)
    {
        var testResult = await testResultRepository.GetTestResultByIdAsync(testResultId, cancellationToken) ?? throw new Exception("TestResult was not found");
        var test = await testRepository.GetByIdAsync(questions.First().TestId, cancellationToken) ?? throw new TestNotFoundException();

        foreach (var userQuestion in questions)
        {
            var testQuestion = test.Questions.FirstOrDefault(q => q.Id == userQuestion.Id);
            if (testQuestion == null) continue;

            bool isCorrect = false;

            switch (userQuestion.Type)
            {
                case QuestionType.SingleChoice:
                case QuestionType.MultipleChoice:
                    isCorrect = userQuestion.AnswerOptions.All(ao =>
                        testQuestion.AnswerOptions.Any(to => to.Id == ao.Id && to.IsCorrect == ao.IsCorrect));
                    break;

                case QuestionType.Matching:
                    isCorrect = userQuestion.AnswerOptions.All(ao =>
                        testQuestion.AnswerOptions.Any(to => to.Id == ao.Id && to.MatchingPair == ao.MatchingPair));
                    break;

                case QuestionType.FillInTheBlank:
                    isCorrect = string.Equals(userQuestion.CorrectAnswer, testQuestion.CorrectAnswer, StringComparison.OrdinalIgnoreCase);
                    break;
            }

            await SaveAnswerAsync(testResultId, userQuestion.Id, isCorrect, cancellationToken);
        }

        testResult.EndedAt = DateTime.UtcNow;

        await testResultRepository.UpdateAsync(testResult, cancellationToken);
    }

    public async Task SaveAnswerAsync(long testResultId, long questionId, bool isCorrect, CancellationToken cancellationToken = default)
    {
        var answerResult = new AnswerResult
        {
            TestResultId = testResultId,
            QuestionId = questionId,
            IsCorrect = isCorrect
        };

        await answerResultRepository.SaveAnswerAsync(answerResult, cancellationToken);
    }

    public async Task<TestResult?> GetTestResultByIdAsync(long testResultId, CancellationToken cancellationToken = default)
    {
        var testResult = await testResultRepository.GetTestResultByIdAsync(testResultId, cancellationToken) ?? throw new Exception("TestResult was not found");
        return testResult;
    }
}
