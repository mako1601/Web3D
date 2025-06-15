using CloudinaryDotNet.Actions;
using Moq;
using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.Domain.Exceptions;
using Web3D.DataAccess.Abstractions;
using Web3D.BusinessLogic.Abstractions;
using Web3D.BusinessLogic.Services;
using Xunit;

namespace Web3D.Test.Services;

public class ArticleServiceTests
{
    private readonly Mock<IArticleRepository> _articleRepositoryMock;
    private readonly Mock<ICloudinaryService> _cloudinaryServiceMock;
    private readonly ArticleService _articleService;

    public ArticleServiceTests()
    {
        _articleRepositoryMock = new Mock<IArticleRepository>();
        _cloudinaryServiceMock = new Mock<ICloudinaryService>();
        _articleService = new ArticleService(
            _articleRepositoryMock.Object,
            _cloudinaryServiceMock.Object);
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateArticle()
    {
        // Arrange
        long authorId = 1;
        string title = "Test Title";
        string description = "Test Description";
        string contentUrl = "https://test.com/content.json";
        long relatedTestId = 1;
        var cancellationToken = CancellationToken.None;

        Article createdArticle = null;
        _articleRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<Article>(), cancellationToken))
            .Callback<Article, CancellationToken>((article, _) => createdArticle = article)
            .Returns(Task.CompletedTask);

        // Act
        await _articleService.CreateAsync(authorId, title, description, contentUrl, relatedTestId, cancellationToken);

        // Assert
        _articleRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<Article>(), cancellationToken), Times.Once);
        Assert.NotNull(createdArticle);
        Assert.Equal(authorId, createdArticle.UserId);
        Assert.Equal(title, createdArticle.Title);
        Assert.Equal(description, createdArticle.Description);
        Assert.Equal(contentUrl, createdArticle.ContentUrl);
        Assert.True(createdArticle.CreatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnArticle_WhenExists()
    {
        // Arrange
        long articleId = 1;
        var expectedArticle = new Article { Id = articleId };
        var cancellationToken = CancellationToken.None;

        _articleRepositoryMock.Setup(x => x.GetByIdAsync(articleId, cancellationToken))
            .ReturnsAsync(expectedArticle);

        // Act
        var result = await _articleService.GetByIdAsync(articleId, cancellationToken);

        // Assert
        Assert.Equal(expectedArticle, result);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldThrowArticleNotFoundException_WhenNotExists()
    {
        // Arrange
        long articleId = 1;
        var cancellationToken = CancellationToken.None;

        _articleRepositoryMock.Setup(x => x.GetByIdAsync(articleId, cancellationToken))
            .ReturnsAsync((Article)null);

        // Act & Assert
        await Assert.ThrowsAsync<ArticleNotFoundException>(
            () => _articleService.GetByIdAsync(articleId, cancellationToken));
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnPageResult()
    {
        // Arrange
        var filter = new Filter();
        var sortParams = new SortParams();
        var pageParams = new PageParams();
        var expectedResult = new PageResult<Article>([new Article()], 1);
        var cancellationToken = CancellationToken.None;

        _articleRepositoryMock.Setup(x => x.GetAllAsync(filter, sortParams, pageParams, cancellationToken))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _articleService.GetAllAsync(filter, sortParams, pageParams, cancellationToken);

        // Assert
        Assert.Equal(expectedResult, result);
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateArticle_WhenExists()
    {
        // Arrange
        long articleId = 1;
        string newTitle = "New Title";
        string newDescription = "New Description";
        string newContentUrl = "https://test.com/new-content.json";
        long relatedTestId = 1;
        var cancellationToken = CancellationToken.None;

        var existingArticle = new Article { Id = articleId };
        _articleRepositoryMock.Setup(x => x.GetByIdAsync(articleId, cancellationToken))
            .ReturnsAsync(existingArticle);

        _articleRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<Article>(), cancellationToken))
            .Returns(Task.CompletedTask);

        // Act
        await _articleService.UpdateAsync(articleId, newTitle, newDescription, newContentUrl, relatedTestId, cancellationToken);

        // Assert
        _articleRepositoryMock.Verify(x => x.GetByIdAsync(articleId, cancellationToken), Times.Once);
        _articleRepositoryMock.Verify(x => x.UpdateAsync(existingArticle, cancellationToken), Times.Once);
        Assert.Equal(newTitle, existingArticle.Title);
        Assert.Equal(newDescription, existingArticle.Description);
        Assert.Equal(newContentUrl, existingArticle.ContentUrl);
        Assert.True(existingArticle.UpdatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrowArticleNotFoundException_WhenNotExists()
    {
        // Arrange
        long articleId = 1;
        var cancellationToken = CancellationToken.None;

        _articleRepositoryMock.Setup(x => x.GetByIdAsync(articleId, cancellationToken))
            .ReturnsAsync((Article)null);

        // Act & Assert
        await Assert.ThrowsAsync<ArticleNotFoundException>(
            () => _articleService.UpdateAsync(articleId, "title", "desc", "url", 1, cancellationToken));
    }

    //[Fact]
    //public async Task DeleteAsync_ShouldDeleteArticleAndResources_WhenExists()
    //{
    //    // Arrange
    //    long articleId = 1;
    //    var contentUrl = "https://res.cloudinary.com/test/raw/upload/test.json";
    //    var jsonContent = @"
    //        {
    //            ""content"": [
    //                {
    //                    ""content"": [
    //                        {
    //                            ""type"": ""image"",
    //                            ""attrs"": { ""src"": ""https://res.cloudinary.com/test/image/upload/test1.jpg"" }
    //                        },
    //                        {
    //                            ""type"": ""image"",
    //                            ""attrs"": { ""src"": ""https://res.cloudinary.com/test/image/upload/test2.jpg"" }
    //                        }
    //                    ]
    //                }
    //            ]
    //        }";
    //    var cancellationToken = CancellationToken.None;

    //    var existingArticle = new Article { Id = articleId, ContentUrl = contentUrl };
    //    _articleRepositoryMock.Setup(x => x.GetByIdAsync(articleId, cancellationToken))
    //        .ReturnsAsync(existingArticle);

    //    _articleRepositoryMock.Setup(x => x.DeleteAsync(existingArticle, cancellationToken))
    //        .Returns(Task.CompletedTask);

    //    var httpMessageHandler = new MockHttpMessageHandler(jsonContent);
    //    var httpClient = new HttpClient(httpMessageHandler);
    //    var httpClientFactoryMock = new Mock<IHttpClientFactory>();
    //    httpClientFactoryMock.Setup(x => x.CreateClient(It.IsAny<string>())).Returns(httpClient);

    //    // Act
    //    await _articleService.DeleteAsync(articleId, cancellationToken);

    //    // Assert
    //    _articleRepositoryMock.Verify(x => x.GetByIdAsync(articleId, cancellationToken), Times.Once);
    //    _articleRepositoryMock.Verify(x => x.DeleteAsync(existingArticle, cancellationToken), Times.Once);

    //    // Verify image deletions
    //    _cloudinaryServiceMock.Verify(x => x.DestroyAsync(It.Is<DeletionParams>(p =>
    //        p.PublicId == "test1" && p.ResourceType == ResourceType.Image)), Times.Once);
    //    _cloudinaryServiceMock.Verify(x => x.DestroyAsync(It.Is<DeletionParams>(p =>
    //        p.PublicId == "test2" && p.ResourceType == ResourceType.Image)), Times.Once);

    //    // Verify JSON deletion
    //    _cloudinaryServiceMock.Verify(x => x.DestroyAsync(It.Is<DeletionParams>(p =>
    //        p.PublicId == "test.json" && p.ResourceType == ResourceType.Raw)), Times.Once);
    //}

    [Fact]
    public async Task DeleteAsync_ShouldThrowArticleNotFoundException_WhenNotExists()
    {
        // Arrange
        long articleId = 1;
        var cancellationToken = CancellationToken.None;

        _articleRepositoryMock.Setup(x => x.GetByIdAsync(articleId, cancellationToken))
            .ReturnsAsync((Article)null);

        // Act & Assert
        await Assert.ThrowsAsync<ArticleNotFoundException>(
            () => _articleService.DeleteAsync(articleId, cancellationToken));
    }

    [Fact]
    public async Task DeleteAsync_ShouldHandleJsonLoadingError()
    {
        // Arrange
        long articleId = 1;
        var contentUrl = "https://test.com/invalid.json";
        var cancellationToken = CancellationToken.None;

        var existingArticle = new Article { Id = articleId, ContentUrl = contentUrl };
        _articleRepositoryMock.Setup(x => x.GetByIdAsync(articleId, cancellationToken))
            .ReturnsAsync(existingArticle);

        var httpMessageHandler = new MockHttpMessageHandler("", System.Net.HttpStatusCode.NotFound);
        var httpClient = new HttpClient(httpMessageHandler);
        var httpClientFactoryMock = new Mock<IHttpClientFactory>();
        httpClientFactoryMock.Setup(x => x.CreateClient(It.IsAny<string>())).Returns(httpClient);

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(
            () => _articleService.DeleteAsync(articleId, cancellationToken));
    }

    // Helper class for mocking HttpClient
    private class MockHttpMessageHandler : HttpMessageHandler
    {
        private readonly string _response;
        private readonly System.Net.HttpStatusCode _statusCode;

        public MockHttpMessageHandler(string response, System.Net.HttpStatusCode statusCode = System.Net.HttpStatusCode.OK)
        {
            _response = response;
            _statusCode = statusCode;
        }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var responseMessage = new HttpResponseMessage(_statusCode)
            {
                Content = new StringContent(_response)
            };
            return await Task.FromResult(responseMessage);
        }
    }
}