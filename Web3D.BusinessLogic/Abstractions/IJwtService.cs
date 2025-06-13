using Web3D.Domain.Models;

namespace Web3D.BusinessLogic.Abstractions;

public interface IJwtService
{
    public string GenerateAccessToken(User user);
    public string GenerateRefreshToken();
}
