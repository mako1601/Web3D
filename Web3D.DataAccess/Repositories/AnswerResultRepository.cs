using Microsoft.EntityFrameworkCore;

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

    public async Task<bool> IsAnswerCorrectAsync(long questionId, long? answerOptionId, CancellationToken cancellationToken = default)
    {
        var answerOption = await context.AnswerOptions.FirstOrDefaultAsync(x => x.Id == answerOptionId && x.QuestionId == questionId, cancellationToken: cancellationToken);
        return answerOption is not null && answerOption.IsCorrect;
    }
}
