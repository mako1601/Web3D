using Microsoft.AspNetCore.Identity;

using Web3D.Domain.Models;
using Web3D.DataAccess.Abstractions;
using Web3D.BusinessLogic.Abstractions;
using Web3D.Domain;
using Web3D.Domain.Filters;

namespace Web3D.BusinessLogic.Services;

internal class UserService(IUserRepository userRepository, JwtService jwtService) : IUserService
{
    public async Task<string> RegisterAsync(string login, string password, string lastName, string firstName, string? middleName, Role role, bool rememberMe, CancellationToken cancellationToken = default)
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
        return jwtService.GenerateToken(user, rememberMe);
    }

    public async Task<string> LoginAsync(string login, string password, bool rememberMe, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.LoginAsync(login, cancellationToken)
                   ?? throw new Exception("User was not found");
        var result = new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, password);

        if (result is PasswordVerificationResult.Success)
        {
            user.LastActivity = DateTime.UtcNow;
            return jwtService.GenerateToken(user, rememberMe);
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
}
