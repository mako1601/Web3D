using Web3D.Domain.Models;
using Web3D.DataAccess.Contexts;
using Web3D.DataAccess.Abstractions;

namespace Web3D.DataAccess.Repositories;

internal class AnswerResultRepository(Web3DDbContext context) : IAnswerResultRepository
{
    public async Task SaveAnswerAsync(AnswerResult answerResult, CancellationToken cancellationToken = default)
    {
        await context.AnswerResults.AddAsync(answerResult, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }
}
