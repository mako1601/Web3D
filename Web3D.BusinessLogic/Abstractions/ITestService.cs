using Web3D.Domain.Models;

namespace Web3D.BusinessLogic.Abstractions;

public interface ITestService
{
    public Task CreateAsync(long userId, string title, CancellationToken cancellationToken = default);
    public Task<Test?> GetByIdAsync(long testId, CancellationToken cancellationToken = default);
    public Task<List<Test>> GetAllAsync(CancellationToken cancellationToken = default);
    public Task UpdateAsync(long testId, long userId, string newTitle, ICollection<Question> questions, CancellationToken cancellationToken = default);
    public Task DeleteAsync(long testId, long userId, CancellationToken cancellationToken = default);
    public Task<long> StartTestAsync(long testId, long userId, CancellationToken cancellationToken = default);
    public Task FinishTestAsync(long testResultId, CancellationToken cancellationToken = default);
    public Task SaveAnswerAsync(long testResultId, long QuestionId, long? AnswerOptionId, CancellationToken cancellationToken = default);
    public Task<TestResult?> GetTestResultByIdAsync(long testResultId, CancellationToken cancellationToken = default);
}
