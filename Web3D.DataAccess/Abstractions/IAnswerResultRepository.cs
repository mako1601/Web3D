using Web3D.Domain.Models;

namespace Web3D.DataAccess.Abstractions;

public interface IAnswerResultRepository
{
    public Task SaveAnswerAsync(AnswerResult answerResult, CancellationToken cancellationToken = default);
}
