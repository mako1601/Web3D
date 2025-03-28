﻿namespace Web3D.Domain.Models.DTO;

public class UserDTO
{
    public long Id { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public Role Role { get; set; }
}