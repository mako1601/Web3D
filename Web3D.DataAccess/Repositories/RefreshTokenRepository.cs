using Microsoft.EntityFrameworkCore;

using Web3D.Domain.Models;
using Web3D.DataAccess.Contexts;
using Web3D.DataAccess.Abstractions;

namespace Web3D.DataAccess.Repositories;

internal class RefreshTokenRepository(Web3DDbContext context) : IRefreshTokenRepository
{
    public async Task SaveAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
    {
        var result = await context.RefreshTokens.FirstOrDefaultAsync(x => x.UserId == refreshToken.UserId, cancellationToken: cancellationToken);

        if (result is null)
        {
            await context.RefreshTokens.AddAsync(refreshToken, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);
        }
        else
        {
            context.RefreshTokens.Update(refreshToken);
            await context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task CreateAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
    {
        await context.RefreshTokens.AddAsync(refreshToken, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await context.RefreshTokens.FirstOrDefaultAsync(x => x.Token.Equals(token), cancellationToken: cancellationToken);
    }

    public async Task<RefreshToken?> GetByUserIdAsync(long userId, CancellationToken cancellationToken = default)
    {
        return await context.RefreshTokens.FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken: cancellationToken);
    }

    public async Task UpdateAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
    {
        context.RefreshTokens.Update(refreshToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
    {
        context.RefreshTokens.Remove(refreshToken);
        await context.SaveChangesAsync(cancellationToken);
    }
}
