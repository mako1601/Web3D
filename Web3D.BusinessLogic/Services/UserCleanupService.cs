using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;

using Web3D.Domain.Models;
using Web3D.DataAccess.Abstractions;

namespace Web3D.BusinessLogic.Services;

public class UserCleanupService(IServiceProvider serviceProvider) : IHostedService, IDisposable
{
    private Timer? _timer;

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _timer = new Timer(CleanupInactiveUsers, null, TimeSpan.Zero, TimeSpan.FromDays(1));
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _timer?.Change(Timeout.Infinite, 0);
        return Task.CompletedTask;
    }

    private async void CleanupInactiveUsers(object? state)
    {
        using var scope = serviceProvider.CreateScope();
        var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var inactiveUsers = await userRepository.GetAllAsync(DateTime.UtcNow.AddYears(-1));

        foreach (var user in inactiveUsers)
        {
            await userRepository.DeleteAsync(user);
        }
    }

    public void Dispose() => _timer?.Dispose();
}
