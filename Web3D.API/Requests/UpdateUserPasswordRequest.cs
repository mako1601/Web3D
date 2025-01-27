namespace Web3D.API.Requests;
public record UpdateUserPasswordRequest(string OldPassword, string NewPassword, string ConfirmPassword);