namespace Web3D.Domain.Models;

public class User
{
    public long Id { get; set; }
    public string Login { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; } = string.Empty;
    public Role Role { get; set; }
    public ICollection<Test> Tests { get; set; } = [];
    public ICollection<Article> Articles { get; set; } = [];
    public DateTime LastActivity { get; set; }
}
