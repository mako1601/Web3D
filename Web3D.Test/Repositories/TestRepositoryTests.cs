using Microsoft.EntityFrameworkCore;
using Web3D.DataAccess.Contexts;
using Web3D.DataAccess.Repositories;
using Web3D.Domain.Exceptions;
using Web3D.Domain.Filters;
using Web3D.Domain.Models;
using Xunit;

namespace Web3D.Test.Repositories;

public class TestRepositoryTests
{
    private static Web3DDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<Web3DDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new Web3DDbContext(options);
    }

    [Fact]
    public async Task CreateAsync_ShouldAddTestAndUpdateUser()
    {
        var context = CreateContext();
        var user = new User { Id = 1 };
        await context.Users.AddAsync(user);
        await context.SaveChangesAsync();

        var testRepo = new TestRepository(context);
        var test = new Domain.Models.Test
        {
            UserId = 1,
            Title = "New Test",
            Description = "Description",
            Questions = []
        };

        await testRepo.CreateAsync(test);

        var created = await context.Tests.FirstOrDefaultAsync();
        Assert.NotNull(created);
        Assert.Equal("New Test", created!.Title);
        Assert.NotNull(user.LastActivity);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrowIfUserNotFound()
    {
        var context = CreateContext();
        var repo = new TestRepository(context);

        var test = new Domain.Models.Test { UserId = 42, Title = "Invalid" };

        await Assert.ThrowsAsync<UserNotFoundException>(() =>
            repo.CreateAsync(test));
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnTestWithQuestions()
    {
        var context = CreateContext();
        var test = new Domain.Models.Test
        {
            Id = 1,
            UserId = 1,
            Title = "Sample",
            Questions = new List<Question>
            {
                new() { Id = 1, Text = "Q1" },
                new() { Id = 2, Text = "Q2" }
            }
        };
        await context.Tests.AddAsync(test);
        await context.SaveChangesAsync();

        var repo = new TestRepository(context);
        var result = await repo.GetByIdAsync(1);

        Assert.NotNull(result);
        Assert.Equal(2, result!.Questions.Count);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNullIfNotFound()
    {
        var context = CreateContext();
        var repo = new TestRepository(context);

        var result = await repo.GetByIdAsync(999);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnPagedTests()
    {
        var context = CreateContext();
        for (int i = 0; i < 10; i++)
        {
            context.Tests.Add(new Domain.Models.Test { Title = $"Test {i}", UserId = 1, Questions = [] });
        }
        await context.SaveChangesAsync();

        var repo = new TestRepository(context);
        var filter = new Filter(); // если он используется в расширении
        var sort = new SortParams(); // без сортировки
        var page = new PageParams { CurrentPage = 1, PageSize = 5 };

        // Act
        var result = await repo.GetAllAsync(filter, sort, page);

        Assert.Equal(5, result.Data.Length);
        Assert.Equal(10, result.TotalCount);
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateTestAndUser()
    {
        var context = CreateContext();
        var user = new User { Id = 1 };
        var test = new Domain.Models.Test { Id = 1, UserId = 1, Title = "Old", Questions = [] };
        await context.Users.AddAsync(user);
        await context.Tests.AddAsync(test);
        await context.SaveChangesAsync();

        var repo = new TestRepository(context);
        test.Title = "Updated";

        await repo.UpdateAsync(test);

        var updated = await context.Tests.FindAsync(1L);
        Assert.Equal("Updated", updated!.Title);
        Assert.NotNull(user.LastActivity);
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrowIfUserNotFound()
    {
        var context = CreateContext();
        var repo = new TestRepository(context);

        var test = new Domain.Models.Test { Id = 1, UserId = 99, Title = "Test" };

        await Assert.ThrowsAsync<UserNotFoundException>(() => repo.UpdateAsync(test));
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemoveTestAndUpdateUser()
    {
        var context = CreateContext();
        var user = new User { Id = 1 };
        var test = new Domain.Models.Test { Id = 10, UserId = 1, Title = "DeleteMe", Questions = [] };

        await context.Users.AddAsync(user);
        await context.Tests.AddAsync(test);
        await context.SaveChangesAsync();

        var repo = new TestRepository(context);
        await repo.DeleteAsync(test);

        Assert.Null(await context.Tests.FindAsync(10L));
        Assert.NotNull(user.LastActivity);
    }

    [Fact]
    public async Task DeleteAsync_ShouldThrowIfUserNotFound()
    {
        var context = CreateContext();
        var repo = new TestRepository(context);

        var test = new Domain.Models.Test { Id = 1, UserId = 42 };

        await Assert.ThrowsAsync<UserNotFoundException>(() => repo.DeleteAsync(test));
    }
}
