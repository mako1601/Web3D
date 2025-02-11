using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;

using Web3D.Domain.Options;
using Web3D.BusinessLogic.Services;

namespace Web3D.BusinessLogic.Extensions;

public static class AuthExtensions
{
    public static IServiceCollection AddAuth(this IServiceCollection servicesCollection, IConfiguration configuration)
    {
        var authOptions = configuration
            .GetSection(nameof(AuthOptions))
            .Get<AuthOptions>()
            ?? throw new Exception("AuthOptions is null");

        servicesCollection.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(authOptions.SecretKey))
                };

                options.Events = new JwtBearerEvents()
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Cookies["accessToken"];
                        if (!string.IsNullOrEmpty(accessToken))
                        {
                            context.Token = accessToken;
                        }

                        return Task.CompletedTask;
                    }
                };
            });

        servicesCollection.AddScoped<JwtService>();

        return servicesCollection;
    }
}
