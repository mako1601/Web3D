using Microsoft.EntityFrameworkCore;
using Web3D.DataAccess.Contexts;
using Web3D.DataAccess.Repositories;
using Web3D.Domain.Models;
using Xunit;

namespace Web3D.Test.Repositories;

public class TokenRepositoryTests
{
    private static Web3DDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<Web3DDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new Web3DDbContext(options);
    }

    [Fact]
    public async Task CreateAsync_ShouldAddRefreshToken()
    {
        var context = CreateContext();
        var repo = new TokenRepository(context);

        var token = new RefreshToken
        {
            Token = "token123",
            UserId = 1,
            ExpiresAt = DateTime.UtcNow.AddDays(1)
        };

        await repo.CreateAsync(token);

        var result = await context.RefreshTokens.FirstOrDefaultAsync();
        Assert.NotNull(result);
        Assert.Equal("token123", result!.Token);
    }

    [Fact]
    public async Task GetByTokenAsync_ShouldReturnToken_WhenExists()
    {
        var context = CreateContext();
        var token = new RefreshToken
        {
            Token = "abc123",
            UserId = 1,
            ExpiresAt = DateTime.UtcNow.AddDays(1)
        };
        await context.RefreshTokens.AddAsync(token);
        await context.SaveChangesAsync();

        var repo = new TokenRepository(context);
        var result = await repo.GetByTokenAsync("abc123");

        Assert.NotNull(result);
        Assert.Equal("abc123", result!.Token);
    }

    [Fact]
    public async Task GetByTokenAsync_ShouldReturnNull_WhenNotExists()
    {
        var context = CreateContext();
        var repo = new TokenRepository(context);

        var result = await repo.GetByTokenAsync("notfound");

        Assert.Null(result);
    }

    [Fact]
    public async Task GetByUserIdAsync_ShouldReturnToken_WhenExists()
    {
        var context = CreateContext();
        var token = new RefreshToken
        {
            Token = "user-token",
            UserId = 5,
            ExpiresAt = DateTime.UtcNow.AddDays(1)
        };
        await context.RefreshTokens.AddAsync(token);
        await context.SaveChangesAsync();

        var repo = new TokenRepository(context);
        var result = await repo.GetByUserIdAsync(5);

        Assert.NotNull(result);
        Assert.Equal("user-token", result!.Token);
    }

    [Fact]
    public async Task GetByUserIdAsync_ShouldReturnNull_WhenNotExists()
    {
        var context = CreateContext();
        var repo = new TokenRepository(context);

        var result = await repo.GetByUserIdAsync(99);

        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateRefreshToken()
    {
        var context = CreateContext();
        var token = new RefreshToken
        {
            Id = 1,
            Token = "original",
            UserId = 1,
            ExpiresAt = DateTime.UtcNow
        };
        await context.RefreshTokens.AddAsync(token);
        await context.SaveChangesAsync();

        token.Token = "updated";
        token.ExpiresAt = DateTime.UtcNow.AddDays(5);

        var repo = new TokenRepository(context);
        await repo.UpdateAsync(token);

        var updated = await context.RefreshTokens.FindAsync(1L);
        Assert.Equal("updated", updated!.Token);
        Assert.True(updated.ExpiresAt > DateTime.UtcNow);
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemoveRefreshToken()
    {
        var context = CreateContext();
        var token = new RefreshToken
        {
            Id = 1,
            Token = "todelete",
            UserId = 1
        };
        await context.RefreshTokens.AddAsync(token);
        await context.SaveChangesAsync();

        var repo = new TokenRepository(context);
        await repo.DeleteAsync(token);

        var deleted = await context.RefreshTokens.FindAsync(1L);
        Assert.Null(deleted);
    }
}
