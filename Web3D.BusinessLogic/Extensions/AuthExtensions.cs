using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;

using Web3D.Domain.Settings;
using Web3D.BusinessLogic.Services;

namespace Web3D.BusinessLogic.Extensions;

public static class AuthExtensions
{
    public static IServiceCollection AddAuth(this IServiceCollection servicesCollection, IConfiguration configuration)
    {
        var authSettings = configuration
            .GetSection(nameof(AuthSettings))
            .Get<AuthSettings>()
            ?? throw new Exception("AuthSettings is null");

        servicesCollection.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(x =>
            {
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(authSettings.SecretKey))
                };
            });

        servicesCollection.AddScoped<JwtService>();

        return servicesCollection;
    }
}
