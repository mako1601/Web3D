namespace Web3D.API.Requests;
public record TestRequest(string Title, ICollection<Domain.Models.Question> Questions);