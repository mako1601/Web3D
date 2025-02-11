using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.Domain.Models.DTO;
using Web3D.DataAccess.Abstractions;
using Web3D.BusinessLogic.Abstractions;

namespace Web3D.BusinessLogic.Services;

internal class UserService(
    IUserRepository userRepository,
    IRefreshTokenRepository refreshTokenRepository,
    JwtService jwtService,
    IHttpContextAccessor httpContextAccessor)
    : IUserService
{
    public async Task<(string, string)> RegisterAsync(string login, string password, string lastName, string firstName, string? middleName, Role role, CancellationToken cancellationToken = default)
    {
        if (await userRepository.IsLoginTakenAsync(login, cancellationToken))
        {
            throw new Exception("Login is already taken");
        }

        var user = new User
        {
            Login = login,
            LastName = lastName,
            FirstName = firstName,
            MiddleName = middleName,
            Role = role,
            LastActivity = DateTime.UtcNow,
        };
        user.PasswordHash = new PasswordHasher<User>().HashPassword(user, password);

        await userRepository.RegisterAsync(user, cancellationToken);

        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = JwtService.GenerateRefreshToken(),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IpAddress = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString(),
            UserAgent = httpContextAccessor.HttpContext?.Request.Headers.UserAgent,
        };

        await refreshTokenRepository.CreateAsync(refreshToken, cancellationToken);

        return (jwtService.GenerateAccessToken(user), refreshToken.Token);
    }

    public async Task<(string, string)> LoginAsync(string login, string password, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.LoginAsync(login, cancellationToken)
                   ?? throw new Exception("User was not found");
        var result = new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, password);

        if (result is PasswordVerificationResult.Success)
        {
            user.LastActivity = DateTime.UtcNow;
            await userRepository.UpdateAsync(user, cancellationToken);

            var refreshTokenResult = await refreshTokenRepository.GetByUserIdAsync(user.Id, cancellationToken);
            if (refreshTokenResult is null)
            {
                var refreshToken = new RefreshToken
                {
                    UserId = user.Id,
                    Token = JwtService.GenerateRefreshToken(),
                    ExpiresAt = DateTime.UtcNow.AddDays(7),
                    IpAddress = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString(),
                    UserAgent = httpContextAccessor.HttpContext?.Request.Headers.UserAgent,
                };
                await refreshTokenRepository.CreateAsync(refreshToken, cancellationToken);

                return (jwtService.GenerateAccessToken(user), refreshToken.Token);
            }
            else
            {
                await refreshTokenRepository.UpdateAsync(refreshTokenResult, cancellationToken);
                return (jwtService.GenerateAccessToken(user), refreshTokenResult.Token);
            }
        }
        else
        {
            throw new Exception("Invalid password");
        }
    }

    public async Task<User> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken)
                   ?? throw new Exception("User was not found");

        return user;
    }

    public async Task<PageResult<UserDTO>> GetAllAsync(UserFilter userFilter, SortParams sortParams, PageParams pageParams, CancellationToken cancellationToken = default)
    {
        var users = await userRepository.GetAllAsync(userFilter, sortParams, pageParams, cancellationToken);

        return users;
    }

    public async Task UpdateAsync(long id, string newLastName, string newFirstName, string? newMiddleName, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken)
                   ?? throw new Exception("User was not found");

        user.LastName = newLastName;
        user.FirstName = newFirstName;
        user.MiddleName = newMiddleName;
        user.LastActivity = DateTime.UtcNow;

        await userRepository.UpdateAsync(user, cancellationToken);
    }

    public async Task DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken)
                   ?? throw new Exception("User was not found");

        await userRepository.DeleteAsync(user, cancellationToken);
    }

    public async Task UpdatePasswordAsync(long id, string oldPassword, string newPassword, string confirmPassword, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(id, cancellationToken)
                   ?? throw new Exception("User was not found");
        var result = new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, oldPassword);

        if (result is PasswordVerificationResult.Success)
        {
            if (newPassword.Equals(confirmPassword))
            {
                user.PasswordHash = new PasswordHasher<User>().HashPassword(user, newPassword);
                await userRepository.UpdateAsync(user, cancellationToken);
            }
            else
            {
                throw new Exception("Passwords do not match");
            }
        }
        else
        {
            throw new Exception("Incorrect password");
        }
    }

    public async Task UpdateRoleAsync(long callerUserId, long targetUserId, Role newRole, CancellationToken cancellationToken = default)
    {
        if (callerUserId == targetUserId) throw new Exception("User cannot change his role");

        var user = await userRepository.GetByIdAsync(targetUserId, cancellationToken)
                   ?? throw new Exception("User was not found");

        if (user.Role == Role.Admin) throw new Exception("The Admin role cannot be changed");
        if (newRole == Role.Admin) throw new Exception("The new role cannot be an Admin role");

        user.Role = newRole;

        await userRepository.UpdateAsync(user, cancellationToken);
    }

    public async Task<string> RefreshAccessTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        var refreshToken = await refreshTokenRepository.GetByTokenAsync(token, cancellationToken);

        if (refreshToken == null || !refreshToken.IsActive) throw new Exception("Invalid or expired refresh token");

        var user = await userRepository.GetByIdAsync(refreshToken.UserId, cancellationToken) ?? throw new Exception("User was not found");

        return jwtService.GenerateAccessToken(user);
    }
}
