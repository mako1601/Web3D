using Microsoft.EntityFrameworkCore;
using Web3D.DataAccess.Contexts;
using Web3D.DataAccess.Repositories;
using Web3D.Domain.Filters;
using Web3D.Domain.Models;
using Xunit;

namespace Web3D.Test.Repositories;

public class UserRepositoryTests
{
    private static Web3DDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<Web3DDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new Web3DDbContext(options);
    }

    [Fact]
    public async Task RegisterAsync_ShouldAddUser()
    {
        var context = CreateContext();
        var repo = new UserRepository(context);

        var user = new User { Login = "test", PasswordHash = "123", Role = Role.Student };
        await repo.RegisterAsync(user);

        var created = await context.Users.FirstOrDefaultAsync();
        Assert.NotNull(created);
        Assert.Equal("test", created!.Login);
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnUser_WhenLoginExists()
    {
        var context = CreateContext();
        await context.Users.AddAsync(new User { Login = "user1", PasswordHash = "hash", Role = Role.Teacher });
        await context.SaveChangesAsync();

        var repo = new UserRepository(context);
        var user = await repo.LoginAsync("user1");

        Assert.NotNull(user);
        Assert.Equal("user1", user!.Login);
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnNull_WhenLoginDoesNotExist()
    {
        var context = CreateContext();
        var repo = new UserRepository(context);

        var user = await repo.LoginAsync("unknown");

        Assert.Null(user);
    }

    [Fact]
    public async Task IsLoginTakenAsync_ShouldReturnTrue_WhenExists()
    {
        var context = CreateContext();
        await context.Users.AddAsync(new User { Login = "taken", PasswordHash = "hash" });
        await context.SaveChangesAsync();

        var repo = new UserRepository(context);
        var result = await repo.IsLoginTakenAsync("taken");

        Assert.True(result);
    }

    [Fact]
    public async Task IsLoginTakenAsync_ShouldReturnFalse_WhenNotExists()
    {
        var context = CreateContext();
        var repo = new UserRepository(context);

        var result = await repo.IsLoginTakenAsync("not_taken");

        Assert.False(result);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnUser_WhenExists()
    {
        var context = CreateContext();
        await context.Users.AddAsync(new User { Id = 10, Login = "found", PasswordHash = "hash" });
        await context.SaveChangesAsync();

        var repo = new UserRepository(context);
        var user = await repo.GetByIdAsync(10);

        Assert.NotNull(user);
        Assert.Equal("found", user!.Login);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNull_WhenNotExists()
    {
        var context = CreateContext();
        var repo = new UserRepository(context);

        var user = await repo.GetByIdAsync(12345);

        Assert.Null(user);
    }

    [Fact]
    public async Task GetAllAsync_FilteredByLastActivity_ShouldReturnCorrectUsers()
    {
        var context = CreateContext();
        var now = DateTime.UtcNow;
        await context.Users.AddRangeAsync(
            new User { Login = "active", LastActivity = now, Role = Role.Student },
            new User { Login = "old1", LastActivity = now.AddDays(-10), Role = Role.Student },
            new User { Login = "admin", LastActivity = now.AddDays(-30), Role = Role.Admin }
        );
        await context.SaveChangesAsync();

        var repo = new UserRepository(context);
        var result = await repo.GetAllAsync(now.AddDays(-5));

        Assert.Single(result);
        Assert.Equal("old1", result[0].Login);
    }

    [Fact]
    public async Task GetAllAsync_PageResult_ShouldReturnPagedUsers()
    {
        var context = CreateContext();
        for (int i = 1; i <= 8; i++)
        {
            await context.Users.AddAsync(new User { Login = $"user{i}", PasswordHash = "p", Role = Role.Student });
        }
        await context.SaveChangesAsync();

        var repo = new UserRepository(context);
        var pageParams = new PageParams { CurrentPage = 2, PageSize = 3 };

        var result = await repo.GetAllAsync(new Filter(), new SortParams(), pageParams);

        Assert.Equal(3, result.Data.Length);
        Assert.Equal(8, result.TotalCount);
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateUser()
    {
        var context = CreateContext();
        var user = new User { Id = 1, Login = "before", PasswordHash = "p" };
        await context.Users.AddAsync(user);
        await context.SaveChangesAsync();

        user.Login = "after";

        var repo = new UserRepository(context);
        await repo.UpdateAsync(user);

        var updated = await context.Users.FindAsync(1L);
        Assert.Equal("after", updated!.Login);
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemoveUser()
    {
        var context = CreateContext();
        var user = new User { Id = 1, Login = "todelete" };
        await context.Users.AddAsync(user);
        await context.SaveChangesAsync();

        var repo = new UserRepository(context);
        await repo.DeleteAsync(user);

        var result = await context.Users.FindAsync(1L);
        Assert.Null(result);
    }
}
