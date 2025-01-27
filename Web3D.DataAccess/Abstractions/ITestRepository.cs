using Web3D.Domain.Models;

namespace Web3D.DataAccess.Abstractions;

public interface ITestRepository
{
    public Task CreateAsync(Test test, CancellationToken cancellationToken = default);
    public Task<Test?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    public Task<List<Test>> GetAllAsync(CancellationToken cancellationToken = default);
    public Task UpdateAsync(Test test, CancellationToken cancellationToken = default);
    public Task DeleteAsync(Test test, CancellationToken cancellationToken = default);
}
