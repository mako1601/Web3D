using Web3D.Domain.Models;

namespace Web3D.BusinessLogic.Abstractions;

public interface IUserService
{
    public Task<string> RegisterAsync(string login, string password, string lastName, string firstName, string? middleName, Role role, bool rememberMe, CancellationToken cancellationToken = default);
    public Task<string> LoginAsync(string login, string password, bool rememberMe, CancellationToken cancellationToken = default);
    public Task<User> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    public Task<List<User>> GetAllAsync(CancellationToken cancellationToken = default);
    public Task UpdateAsync(long id, string newLastName, string newFirstName, string? newMiddleName, CancellationToken cancellationToken = default);
    public Task DeleteAsync(long id, CancellationToken cancellationToken = default);
    public Task UpdatePasswordAsync(long id, string oldPassword, string newPassword, string confirmPassword, CancellationToken cancellationToken = default);
    public Task UpdateRoleAsync(long callerUserId, long targetUserId, Role newRole, CancellationToken cancellationToken = default);
}
