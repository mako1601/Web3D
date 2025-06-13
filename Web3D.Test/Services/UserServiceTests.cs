using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Moq;
using System.Net;
using Web3D.BusinessLogic.Abstractions;
using Web3D.BusinessLogic.Services;
using Web3D.DataAccess.Abstractions;
using Web3D.Domain.Exceptions;
using Web3D.Domain.Filters;
using Web3D.Domain.Models;
using Web3D.Domain.Models.Dto;
using Xunit;

namespace Web3D.Test.Services;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<ITokenRepository> _tokenRepositoryMock;
    private readonly Mock<IJwtService> _jwtServiceMock;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly UserService _userService;

    public UserServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _tokenRepositoryMock = new Mock<ITokenRepository>();
        _jwtServiceMock = new Mock<IJwtService>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _userService = new UserService(
            _userRepositoryMock.Object,
            _tokenRepositoryMock.Object,
            _jwtServiceMock.Object,
            _httpContextAccessorMock.Object);
    }

    [Fact]
    public async Task RegisterAsync_ShouldRegisterUserAndReturnTokens()
    {
        // Arrange
        var login = "testuser";
        var password = "Test@123";
        var lastName = "Last";
        var firstName = "First";
        var middleName = "Middle";
        var role = Role.Student;
        var cancellationToken = CancellationToken.None;

        var expectedAccessToken = "access_token";
        var expectedRefreshToken = "refresh_token";
        var expectedIp = "192.168.1.1";
        var expectedUserAgent = "Test User Agent";

        // Setup HttpContext
        var httpContext = new DefaultHttpContext();
        httpContext.Connection.RemoteIpAddress = IPAddress.Parse(expectedIp);
        httpContext.Request.Headers.UserAgent = expectedUserAgent;
        _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(httpContext);

        // Setup repositories and services
        _userRepositoryMock.Setup(x => x.IsLoginTakenAsync(login, cancellationToken))
            .ReturnsAsync(false);

        User createdUser = null;
        _userRepositoryMock.Setup(x => x.RegisterAsync(It.IsAny<User>(), cancellationToken))
            .Callback<User, CancellationToken>((user, _) => createdUser = user)
            .Returns(Task.CompletedTask);

        RefreshToken createdRefreshToken = null;
        _tokenRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<RefreshToken>(), cancellationToken))
            .Callback<RefreshToken, CancellationToken>((token, _) => createdRefreshToken = token)
            .Returns(Task.CompletedTask);

        _jwtServiceMock.Setup(x => x.GenerateRefreshToken()).Returns(expectedRefreshToken);
        _jwtServiceMock.Setup(x => x.GenerateAccessToken(It.IsAny<User>())).Returns(expectedAccessToken);

        // Act
        var result = await _userService.RegisterAsync(login, password, lastName, firstName, middleName, role, cancellationToken);

        // Assert
        Assert.Equal(expectedAccessToken, result.Item1);
        Assert.Equal(expectedRefreshToken, result.Item2);

        Assert.NotNull(createdUser);
        Assert.Equal(login, createdUser.Login);
        Assert.Equal(lastName, createdUser.LastName);
        Assert.Equal(firstName, createdUser.FirstName);
        Assert.Equal(middleName, createdUser.MiddleName);
        Assert.Equal(role, createdUser.Role);
        Assert.NotNull(createdUser.PasswordHash);
        Assert.True(createdUser.LastActivity <= DateTime.UtcNow);

        Assert.NotNull(createdRefreshToken);
        Assert.Equal(createdUser.Id, createdRefreshToken.UserId);
        Assert.Equal(expectedRefreshToken, createdRefreshToken.Token);
        Assert.True(createdRefreshToken.ExpiresAt > DateTime.UtcNow.AddDays(6));
        Assert.Equal(expectedIp, createdRefreshToken.IpAddress);
        Assert.Equal(expectedUserAgent, createdRefreshToken.UserAgent);
    }

    [Fact]
    public async Task RegisterAsync_ShouldThrowLoginAlreadyTakenException_WhenLoginExists()
    {
        // Arrange
        var login = "existinguser";
        var cancellationToken = CancellationToken.None;

        _userRepositoryMock.Setup(x => x.IsLoginTakenAsync(login, cancellationToken))
            .ReturnsAsync(true);

        // Act & Assert
        await Assert.ThrowsAsync<LoginAlreadyTakenException>(
            () => _userService.RegisterAsync(login, "pass", "last", "first", null, Role.Student, cancellationToken));
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnTokens_WhenCredentialsValid()
    {
        // Arrange
        var login = "testuser";
        var password = "Test@123";
        var cancellationToken = CancellationToken.None;

        var expectedAccessToken = "access_token";
        var expectedRefreshToken = "refresh_token";
        var expectedIp = "192.168.1.1";
        var expectedUserAgent = "Test User Agent";

        var user = new User
        {
            Id = 1,
            Login = login,
            PasswordHash = new PasswordHasher<User>().HashPassword(null, password)
        };

        // Setup HttpContext
        var httpContext = new DefaultHttpContext();
        httpContext.Connection.RemoteIpAddress = IPAddress.Parse(expectedIp);
        httpContext.Request.Headers.UserAgent = expectedUserAgent;
        _httpContextAccessorMock.Setup(x => x.HttpContext).Returns(httpContext);

        // Setup repositories and services
        _userRepositoryMock.Setup(x => x.LoginAsync(login, cancellationToken))
            .ReturnsAsync(user);

        User updatedUser = null;
        _userRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<User>(), cancellationToken))
            .Callback<User, CancellationToken>((u, _) => updatedUser = u)
            .Returns(Task.CompletedTask);

        RefreshToken createdRefreshToken = null;
        _tokenRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<RefreshToken>(), cancellationToken))
            .Callback<RefreshToken, CancellationToken>((token, _) => createdRefreshToken = token)
            .Returns(Task.CompletedTask);

        _jwtServiceMock.Setup(x => x.GenerateRefreshToken()).Returns(expectedRefreshToken);
        _jwtServiceMock.Setup(x => x.GenerateAccessToken(user)).Returns(expectedAccessToken);

        // Act
        var result = await _userService.LoginAsync(login, password, cancellationToken);

        // Assert
        Assert.Equal(expectedAccessToken, result.Item1);
        Assert.Equal(expectedRefreshToken, result.Item2);

        Assert.NotNull(updatedUser);
        Assert.True(updatedUser.LastActivity <= DateTime.UtcNow);

        Assert.NotNull(createdRefreshToken);
        Assert.Equal(user.Id, createdRefreshToken.UserId);
        Assert.Equal(expectedRefreshToken, createdRefreshToken.Token);
        Assert.True(createdRefreshToken.ExpiresAt > DateTime.UtcNow.AddDays(6));
        Assert.Equal(expectedIp, createdRefreshToken.IpAddress);
        Assert.Equal(expectedUserAgent, createdRefreshToken.UserAgent);
    }

    [Fact]
    public async Task LoginAsync_ShouldThrowInvalidLoginOrPasswordException_WhenUserNotFound()
    {
        // Arrange
        var login = "nonexistent";
        var cancellationToken = CancellationToken.None;

        _userRepositoryMock.Setup(x => x.LoginAsync(login, cancellationToken))
            .ReturnsAsync((User)null);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidLoginOrPasswordException>(
            () => _userService.LoginAsync(login, "password", cancellationToken));
    }

    [Fact]
    public async Task LoginAsync_ShouldThrowInvalidLoginOrPasswordException_WhenPasswordInvalid()
    {
        // Arrange
        var login = "testuser";
        var password = "wrongpassword";
        var cancellationToken = CancellationToken.None;

        var user = new User
        {
            Login = login,
            PasswordHash = new PasswordHasher<User>().HashPassword(null, "correctpassword")
        };

        _userRepositoryMock.Setup(x => x.LoginAsync(login, cancellationToken))
            .ReturnsAsync(user);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidLoginOrPasswordException>(
            () => _userService.LoginAsync(login, password, cancellationToken));
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnUserDto_WhenUserExists()
    {
        // Arrange
        long userId = 1;
        var cancellationToken = CancellationToken.None;

        var user = new User
        {
            Id = userId,
            LastName = "Last",
            FirstName = "First",
            MiddleName = "Middle",
            Role = Role.Admin
        };

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, cancellationToken))
            .ReturnsAsync(user);

        // Act
        var result = await _userService.GetByIdAsync(userId, cancellationToken);

        // Assert
        Assert.Equal(user.Id, result.Id);
        Assert.Equal(user.LastName, result.LastName);
        Assert.Equal(user.FirstName, result.FirstName);
        Assert.Equal(user.MiddleName, result.MiddleName);
        Assert.Equal(user.Role, result.Role);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldThrowUserNotFoundException_WhenUserNotExists()
    {
        // Arrange
        long userId = 999;
        var cancellationToken = CancellationToken.None;

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, cancellationToken))
            .ReturnsAsync((User)null);

        // Act & Assert
        await Assert.ThrowsAsync<UserNotFoundException>(
            () => _userService.GetByIdAsync(userId, cancellationToken));
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnPageResult()
    {
        // Arrange
        var filter = new Filter();
        var sortParams = new SortParams();
        var pageParams = new PageParams();
        var expectedResult = new PageResult<UserDto>([new UserDto()], 1);
        var cancellationToken = CancellationToken.None;

        _userRepositoryMock.Setup(x => x.GetAllAsync(filter, sortParams, pageParams, cancellationToken))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _userService.GetAllAsync(filter, sortParams, pageParams, cancellationToken);

        // Assert
        Assert.Equal(expectedResult, result);
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateUserDetails_WhenUserExists()
    {
        // Arrange
        long userId = 1;
        var newLastName = "NewLast";
        var newFirstName = "NewFirst";
        var newMiddleName = "NewMiddle";
        var cancellationToken = CancellationToken.None;

        var existingUser = new User
        {
            Id = userId,
            LastName = "OldLast",
            FirstName = "OldFirst",
            MiddleName = "OldMiddle"
        };

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, cancellationToken))
            .ReturnsAsync(existingUser);

        User updatedUser = null;
        _userRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<User>(), cancellationToken))
            .Callback<User, CancellationToken>((user, _) => updatedUser = user)
            .Returns(Task.CompletedTask);

        // Act
        await _userService.UpdateAsync(userId, newLastName, newFirstName, newMiddleName, cancellationToken);

        // Assert
        Assert.NotNull(updatedUser);
        Assert.Equal(newLastName, updatedUser.LastName);
        Assert.Equal(newFirstName, updatedUser.FirstName);
        Assert.Equal(newMiddleName, updatedUser.MiddleName);
        Assert.True(updatedUser.LastActivity <= DateTime.UtcNow);
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrowUserNotFoundException_WhenUserNotExists()
    {
        // Arrange
        long userId = 999;
        var cancellationToken = CancellationToken.None;

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, cancellationToken))
            .ReturnsAsync((User)null);

        // Act & Assert
        await Assert.ThrowsAsync<UserNotFoundException>(
            () => _userService.UpdateAsync(userId, "last", "first", null, cancellationToken));
    }

    [Fact]
    public async Task DeleteAsync_ShouldDeleteUser_WhenUserExists()
    {
        // Arrange
        long userId = 1;
        var cancellationToken = CancellationToken.None;

        var existingUser = new User { Id = userId };
        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, cancellationToken))
            .ReturnsAsync(existingUser);

        _userRepositoryMock.Setup(x => x.DeleteAsync(existingUser, cancellationToken))
            .Returns(Task.CompletedTask);

        // Act
        await _userService.DeleteAsync(userId, cancellationToken);

        // Assert
        _userRepositoryMock.Verify(x => x.DeleteAsync(existingUser, cancellationToken), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ShouldThrowUserNotFoundException_WhenUserNotExists()
    {
        // Arrange
        long userId = 999;
        var cancellationToken = CancellationToken.None;

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, cancellationToken))
            .ReturnsAsync((User)null);

        // Act & Assert
        await Assert.ThrowsAsync<UserNotFoundException>(
            () => _userService.DeleteAsync(userId, cancellationToken));
    }

    [Fact]
    public async Task UpdatePasswordAsync_ShouldUpdatePassword_WhenOldPasswordCorrect()
    {
        // Arrange
        long userId = 1;
        var oldPassword = "oldPass";
        var newPassword = "newPass";
        var cancellationToken = CancellationToken.None;

        var user = new User
        {
            Id = userId,
            PasswordHash = new PasswordHasher<User>().HashPassword(null, oldPassword)
        };

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, cancellationToken))
            .ReturnsAsync(user);

        User updatedUser = null;
        _userRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<User>(), cancellationToken))
            .Callback<User, CancellationToken>((u, _) => updatedUser = u)
            .Returns(Task.CompletedTask);

        // Act
        await _userService.UpdatePasswordAsync(userId, oldPassword, newPassword, cancellationToken);

        // Assert
        Assert.NotNull(updatedUser);
        var passwordVerifier = new PasswordHasher<User>();
        var result = passwordVerifier.VerifyHashedPassword(null, updatedUser.PasswordHash, newPassword);
        Assert.Equal(PasswordVerificationResult.Success, result);
    }

    [Fact]
    public async Task UpdatePasswordAsync_ShouldThrowInvalidLoginOrPasswordException_WhenOldPasswordIncorrect()
    {
        // Arrange
        long userId = 1;
        var oldPassword = "wrongPass";
        var newPassword = "newPass";
        var cancellationToken = CancellationToken.None;

        var user = new User
        {
            Id = userId,
            PasswordHash = new PasswordHasher<User>().HashPassword(null, "correctPass")
        };

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, cancellationToken))
            .ReturnsAsync(user);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidLoginOrPasswordException>(
            () => _userService.UpdatePasswordAsync(userId, oldPassword, newPassword, cancellationToken));
    }

    [Fact]
    public async Task UpdatePasswordAsync_ShouldThrowUserNotFoundException_WhenUserNotExists()
    {
        // Arrange
        long userId = 999;
        var cancellationToken = CancellationToken.None;

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, cancellationToken))
            .ReturnsAsync((User)null);

        // Act & Assert
        await Assert.ThrowsAsync<UserNotFoundException>(
            () => _userService.UpdatePasswordAsync(userId, "old", "new", cancellationToken));
    }

    [Fact]
    public async Task UpdateRoleAsync_ShouldUpdateRole_WhenUserExists()
    {
        // Arrange
        long callerUserId = 1;
        long targetUserId = 2;
        var newRole = Role.Admin;
        var cancellationToken = CancellationToken.None;

        var user = new User
        {
            Id = targetUserId,
            Role = Role.Student
        };

        _userRepositoryMock.Setup(x => x.GetByIdAsync(targetUserId, cancellationToken))
            .ReturnsAsync(user);

        User updatedUser = null;
        _userRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<User>(), cancellationToken))
            .Callback<User, CancellationToken>((u, _) => updatedUser = u)
            .Returns(Task.CompletedTask);

        // Act
        await _userService.UpdateRoleAsync(callerUserId, targetUserId, newRole, cancellationToken);

        // Assert
        Assert.NotNull(updatedUser);
        Assert.Equal(newRole, updatedUser.Role);
    }

    [Fact]
    public async Task UpdateRoleAsync_ShouldThrowUserNotFoundException_WhenUserNotExists()
    {
        // Arrange
        long callerUserId = 1;
        long targetUserId = 999;
        var cancellationToken = CancellationToken.None;

        _userRepositoryMock.Setup(x => x.GetByIdAsync(targetUserId, cancellationToken))
            .ReturnsAsync((User)null);

        // Act & Assert
        await Assert.ThrowsAsync<UserNotFoundException>(
            () => _userService.UpdateRoleAsync(callerUserId, targetUserId, Role.Admin, cancellationToken));
    }

    [Fact]
    public async Task RefreshAccessTokenAsync_ShouldReturnNewAccessToken_WhenUserExists()
    {
        // Arrange
        long userId = 1;
        var expectedToken = "new_access_token";
        var cancellationToken = CancellationToken.None;

        var user = new User { Id = userId };
        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, cancellationToken))
            .ReturnsAsync(user);

        _jwtServiceMock.Setup(x => x.GenerateAccessToken(user)).Returns(expectedToken);

        // Act
        var result = await _userService.RefreshAccessTokenAsync(userId, cancellationToken);

        // Assert
        Assert.Equal(expectedToken, result);
    }

    [Fact]
    public async Task RefreshAccessTokenAsync_ShouldThrowUserNotFoundException_WhenUserNotExists()
    {
        // Arrange
        long userId = 999;
        var cancellationToken = CancellationToken.None;

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, cancellationToken))
            .ReturnsAsync((User)null);

        // Act & Assert
        await Assert.ThrowsAsync<UserNotFoundException>(
            () => _userService.RefreshAccessTokenAsync(userId, cancellationToken));
    }
}