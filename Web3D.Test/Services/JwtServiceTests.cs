using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Moq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Web3D.BusinessLogic.Abstractions;
using Web3D.BusinessLogic.Services;
using Web3D.DataAccess.Abstractions;
using Web3D.Domain.Models;
using Web3D.Domain.Options;
using Xunit;

namespace Web3D.Test.Services;

public class JwtServiceTests : ServiceTestsBase
{
    private readonly JwtService jwtService;
    private readonly AuthOptions authOptions;

    public JwtServiceTests()
    {
        authOptions = new AuthOptions
        {
            SecretKey = "TestSecretKeyTestSecretKeyTestSecretKey",
            Expires = TimeSpan.FromMinutes(30),
        };

        var mockOptions = mockRepository.Create<IOptions<AuthOptions>>();
        mockOptions.Setup(x => x.Value).Returns(authOptions);

        jwtService = new JwtService(mockOptions.Object);
    }

    [Fact]
    public void GenerateAccessToken_ShouldReturnValidToken()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            LastName = "Doe",
            FirstName = "John",
            MiddleName = "M",
            Role = Domain.Models.Role.Student,
        };

        // Act
        var token = jwtService.GenerateAccessToken(user);

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);

        var tokenHandler = new JwtSecurityTokenHandler();
        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(authOptions.SecretKey)
            ),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero,
        };

        var principal = tokenHandler.ValidateToken(
            token,
            validationParameters,
            out var validatedToken
        );
        Assert.NotNull(principal);

        var claims = principal.Claims;
        Assert.Contains(claims, c => c.Type == "id" && c.Value == user.Id.ToString());
        Assert.Contains(claims, c => c.Type == "lastName" && c.Value == user.LastName);
        Assert.Contains(claims, c => c.Type == "firstName" && c.Value == user.FirstName);
        Assert.Contains(claims, c => c.Type == "middleName" && c.Value == user.MiddleName);
        Assert.Contains(claims, c => c.Type == ClaimTypes.Role && c.Value == user.Role.ToString());
    }

    [Fact]
    public void GenerateRefreshToken_ShouldReturnRandomToken()
    {
        // Act
        var token1 = jwtService.GenerateRefreshToken();
        var token2 = jwtService.GenerateRefreshToken();

        // Assert
        Assert.NotNull(token1);
        Assert.NotEmpty(token1);
        Assert.NotNull(token2);
        Assert.NotEmpty(token2);
        Assert.NotEqual(token1, token2);
    }
}
