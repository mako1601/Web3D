using Microsoft.AspNetCore.Http;
using Moq;
using System.Net;
using Web3D.BusinessLogic.Abstractions;
using Web3D.BusinessLogic.Services;
using Web3D.DataAccess.Abstractions;
using Web3D.Domain.Exceptions;
using Web3D.Domain.Models;
using Xunit;

namespace Web3D.Test.Services;

public class TokenServiceTests
{
    private readonly Mock<ITokenRepository> _tokenRepositoryMock;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly Mock<IJwtService> _jwtServiceMock;
    private readonly TokenService _tokenService;

    public TokenServiceTests()
    {
        _tokenRepositoryMock = new Mock<ITokenRepository>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _jwtServiceMock = new Mock<IJwtService>();
        _tokenService = new TokenService(
            _tokenRepositoryMock.Object,
            _httpContextAccessorMock.Object,
            _jwtServiceMock.Object);
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateRefreshTokenWithCorrectData()
    {
        // Arrange
        long userId = 1;
        var expectedToken = "generated_refresh_token";
        var expectedIp = "192.168.1.1";
        var expectedUserAgent = "Test User Agent";
        var cancellationToken = CancellationToken.None;

        // Setup HttpContext
        var httpContext = new DefaultHttpContext();
        httpContext.Connection.RemoteIpAddress = IPAddress.Parse(expectedIp);
        httpContext.Request.Headers.UserAgent = expectedUserAgent;
        _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(httpContext);

        // Setup JWT service
        _jwtServiceMock.Setup(x => x.GenerateRefreshToken()).Returns(expectedToken);

        RefreshToken createdToken = null;
        _tokenRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<RefreshToken>(), cancellationToken))
            .Callback<RefreshToken, CancellationToken>((token, _) => createdToken = token)
            .Returns(Task.CompletedTask);

        // Act
        await _tokenService.CreateAsync(userId, cancellationToken);

        // Assert
        _tokenRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<RefreshToken>(), cancellationToken), Times.Once);

        Assert.NotNull(createdToken);
        Assert.Equal(userId, createdToken.UserId);
        Assert.Equal(expectedToken, createdToken.Token);
        Assert.True(createdToken.ExpiresAt > DateTime.UtcNow.AddDays(6) && createdToken.ExpiresAt <= DateTime.UtcNow.AddDays(7));
        Assert.Equal(expectedIp, createdToken.IpAddress);
        Assert.Equal(expectedUserAgent, createdToken.UserAgent);
    }

    [Fact]
    public async Task CreateAsync_ShouldHandleNullHttpContext()
    {
        // Arrange
        long userId = 1;
        var expectedToken = "generated_refresh_token";
        var cancellationToken = CancellationToken.None;

        // Setup null HttpContext
        _httpContextAccessorMock.Setup(x => x.HttpContext).Returns((HttpContext)null);

        // Setup JWT service
        _jwtServiceMock.Setup(x => x.GenerateRefreshToken()).Returns(expectedToken);

        RefreshToken createdToken = null;
        _tokenRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<RefreshToken>(), cancellationToken))
            .Callback<RefreshToken, CancellationToken>((token, _) => createdToken = token)
            .Returns(Task.CompletedTask);

        // Act
        await _tokenService.CreateAsync(userId, cancellationToken);

        // Assert
        _tokenRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<RefreshToken>(), cancellationToken), Times.Once);

        Assert.NotNull(createdToken);
        Assert.Equal(userId, createdToken.UserId);
        Assert.Equal(expectedToken, createdToken.Token);
        Assert.Null(createdToken.IpAddress);
        Assert.Null(createdToken.UserAgent);
    }

    [Fact]
    public async Task GetByTokenAsync_ShouldReturnToken_WhenExists()
    {
        // Arrange
        var tokenString = "test_token";
        var expectedToken = new RefreshToken { Token = tokenString };
        var cancellationToken = CancellationToken.None;

        _tokenRepositoryMock.Setup(x => x.GetByTokenAsync(tokenString, cancellationToken))
            .ReturnsAsync(expectedToken);

        // Act
        var result = await _tokenService.GetByTokenAsync(tokenString, cancellationToken);

        // Assert
        Assert.Equal(expectedToken, result);
    }

    [Fact]
    public async Task GetByTokenAsync_ShouldThrowRefreshTokenNotFoundException_WhenNotExists()
    {
        // Arrange
        var tokenString = "non_existing_token";
        var cancellationToken = CancellationToken.None;

        _tokenRepositoryMock.Setup(x => x.GetByTokenAsync(tokenString, cancellationToken))
            .ReturnsAsync((RefreshToken)null);

        // Act & Assert
        await Assert.ThrowsAsync<RefreshTokenNotFoundException>(
            () => _tokenService.GetByTokenAsync(tokenString, cancellationToken));
    }

    [Fact]
    public async Task UpdateByTokenAsync_ShouldUpdateTokenWithNewData()
    {
        // Arrange
        var oldTokenString = "old_token";
        var newTokenString = "new_token";
        var expectedIp = "192.168.1.1";
        var expectedUserAgent = "Test User Agent";
        var cancellationToken = CancellationToken.None;

        var existingToken = new RefreshToken
        {
            Token = oldTokenString,
            ExpiresAt = DateTime.UtcNow.AddDays(1),
            IpAddress = "old_ip",
            UserAgent = "old_agent"
        };

        // Setup HttpContext
        var httpContext = new DefaultHttpContext();
        httpContext.Connection.RemoteIpAddress = IPAddress.Parse(expectedIp);
        httpContext.Request.Headers.UserAgent = expectedUserAgent;
        _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(httpContext);

        // Setup JWT service
        _jwtServiceMock.Setup(x => x.GenerateRefreshToken()).Returns(newTokenString);

        _tokenRepositoryMock.Setup(x => x.GetByTokenAsync(oldTokenString, cancellationToken))
            .ReturnsAsync(existingToken);

        _tokenRepositoryMock.Setup(x => x.UpdateAsync(existingToken, cancellationToken))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _tokenService.UpdateByTokenAsync(oldTokenString, cancellationToken);

        // Assert
        _tokenRepositoryMock.Verify(x => x.GetByTokenAsync(oldTokenString, cancellationToken), Times.Once);
        _tokenRepositoryMock.Verify(x => x.UpdateAsync(existingToken, cancellationToken), Times.Once);

        Assert.NotNull(result);
        Assert.Equal(newTokenString, result.Token);
        Assert.True(result.ExpiresAt > DateTime.UtcNow.AddDays(6) && result.ExpiresAt <= DateTime.UtcNow.AddDays(7));
        Assert.Equal(expectedIp, result.IpAddress);
        Assert.Equal(expectedUserAgent, result.UserAgent);
    }

    [Fact]
    public async Task UpdateByTokenAsync_ShouldThrowRefreshTokenNotFoundException_WhenNotExists()
    {
        // Arrange
        var tokenString = "non_existing_token";
        var cancellationToken = CancellationToken.None;

        _tokenRepositoryMock.Setup(x => x.GetByTokenAsync(tokenString, cancellationToken))
            .ReturnsAsync((RefreshToken)null);

        // Act & Assert
        await Assert.ThrowsAsync<RefreshTokenNotFoundException>(
            () => _tokenService.UpdateByTokenAsync(tokenString, cancellationToken));
    }

    [Fact]
    public async Task DeleteAsync_ShouldDeleteToken_WhenExists()
    {
        // Arrange
        var tokenString = "token_to_delete";
        var existingToken = new RefreshToken { Token = tokenString };
        var cancellationToken = CancellationToken.None;

        _tokenRepositoryMock.Setup(x => x.GetByTokenAsync(tokenString, cancellationToken))
            .ReturnsAsync(existingToken);

        _tokenRepositoryMock.Setup(x => x.DeleteAsync(existingToken, cancellationToken))
            .Returns(Task.CompletedTask);

        // Act
        await _tokenService.DeleteAsync(tokenString, cancellationToken);

        // Assert
        _tokenRepositoryMock.Verify(x => x.GetByTokenAsync(tokenString, cancellationToken), Times.Once);
        _tokenRepositoryMock.Verify(x => x.DeleteAsync(existingToken, cancellationToken), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ShouldThrowRefreshTokenNotFoundException_WhenNotExists()
    {
        // Arrange
        var tokenString = "non_existing_token";
        var cancellationToken = CancellationToken.None;

        _tokenRepositoryMock.Setup(x => x.GetByTokenAsync(tokenString, cancellationToken))
            .ReturnsAsync((RefreshToken)null);

        // Act & Assert
        await Assert.ThrowsAsync<RefreshTokenNotFoundException>(
            () => _tokenService.DeleteAsync(tokenString, cancellationToken));
    }
}
