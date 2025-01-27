using Microsoft.Extensions.DependencyInjection;

using Web3D.BusinessLogic.Services;
using Web3D.BusinessLogic.Abstractions;

namespace Web3D.BusinessLogic.Extensions;

public static class ServiceExtension
{
    public static IServiceCollection AddServices(this IServiceCollection servicesCollection)
    {
        servicesCollection.AddScoped<IUserService, UserService>();
        servicesCollection.AddScoped<ITestService, TestService>();
        servicesCollection.AddScoped<IArticleService, ArticleService>();

        servicesCollection.AddHostedService<UserCleanupService>();

        return servicesCollection;
    }
}
