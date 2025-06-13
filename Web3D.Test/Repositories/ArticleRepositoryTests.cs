using Microsoft.EntityFrameworkCore;
using Web3D.DataAccess.Contexts;
using Web3D.DataAccess.Repositories;
using Web3D.Domain.Exceptions;
using Web3D.Domain.Filters;
using Web3D.Domain.Models;
using Xunit;

namespace Web3D.Test.Repositories;

public class ArticleRepositoryTests
{
    private static Web3DDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<Web3DDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new Web3DDbContext(options);
    }

    [Fact]
    public async Task CreateAsync_ShouldAddArticle()
    {
        // Arrange
        var context = CreateContext();
        var repo = new ArticleRepository(context);
        var article = new Article { Title = "Test", UserId = 1 };

        // Act
        await repo.CreateAsync(article);

        // Assert
        var created = await context.Articles.FirstOrDefaultAsync();
        Assert.NotNull(created);
        Assert.Equal("Test", created.Title);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnCorrectArticle()
    {
        // Arrange
        var context = CreateContext();
        var article = new Article { Id = 5, Title = "Test", UserId = 1 };
        await context.Articles.AddAsync(article);
        await context.SaveChangesAsync();

        var repo = new ArticleRepository(context);

        // Act
        var result = await repo.GetByIdAsync(5);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Test", result!.Title);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnNullIfNotFound()
    {
        var context = CreateContext();
        var repo = new ArticleRepository(context);

        var result = await repo.GetByIdAsync(999);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnPagedResult()
    {
        // Arrange
        var context = CreateContext();
        for (int i = 1; i <= 10; i++)
        {
            context.Articles.Add(new Article { Title = $"Article {i}", UserId = 1 });
        }
        await context.SaveChangesAsync();

        var repo = new ArticleRepository(context);
        var filter = new Filter(); // если он используется в расширении
        var sort = new SortParams(); // без сортировки
        var page = new PageParams { CurrentPage = 1, PageSize = 5 };

        // Act
        var result = await repo.GetAllAsync(filter, sort, page);

        // Assert
        Assert.Equal(5, result.Data.Length);
        Assert.Equal(10, result.TotalCount);
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateArticleAndUserActivity()
    {
        // Arrange
        var context = CreateContext();
        var user = new User { Id = 1 };
        var article = new Article { Id = 2, UserId = 1, Title = "Old" };
        await context.Users.AddAsync(user);
        await context.Articles.AddAsync(article);
        await context.SaveChangesAsync();

        var repo = new ArticleRepository(context);
        article.Title = "Updated";

        // Act
        await repo.UpdateAsync(article);

        // Assert
        var updated = await context.Articles.FindAsync(2L);
        Assert.Equal("Updated", updated!.Title);
        Assert.NotNull(user.LastActivity);
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrowIfUserNotFound()
    {
        var context = CreateContext();
        var repo = new ArticleRepository(context);
        var article = new Article { Id = 1, UserId = 42, Title = "Title" };

        await Assert.ThrowsAsync<UserNotFoundException>(() => repo.UpdateAsync(article));
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemoveArticleAndUpdateUser()
    {
        var context = CreateContext();
        var user = new User { Id = 1 };
        var article = new Article { Id = 10, UserId = 1, Title = "ToDelete" };
        await context.Users.AddAsync(user);
        await context.Articles.AddAsync(article);
        await context.SaveChangesAsync();

        var repo = new ArticleRepository(context);

        // Act
        await repo.DeleteAsync(article);

        // Assert
        Assert.Null(await context.Articles.FindAsync(10L));
        Assert.NotNull(user.LastActivity);
    }

    [Fact]
    public async Task DeleteAsync_ShouldThrowIfUserNotFound()
    {
        var context = CreateContext();
        var repo = new ArticleRepository(context);
        var article = new Article { Id = 99, UserId = 123 };

        await Assert.ThrowsAsync<UserNotFoundException>(() => repo.DeleteAsync(article));
    }
}
