using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

using Web3D.Domain.Models;
using Web3D.Domain.Settings;

namespace Web3D.BusinessLogic.Services;

internal class JwtService(IOptions<AuthSettings> options)
{
    public string GenerateToken(User user, bool rememberMe)
    {
        var claims = new List<Claim>
        {
            new("id", user.Id.ToString()),
            new("role", user.Role.ToString())
        };

        // TODO: обновление токена
        var jwtToken = new JwtSecurityToken(
            expires: rememberMe ? DateTime.UtcNow.Add(options.Value.Expires) : null,
            claims: claims,
            signingCredentials:
                new SigningCredentials(
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Value.SecretKey)),
                    SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(jwtToken);
    }
}
