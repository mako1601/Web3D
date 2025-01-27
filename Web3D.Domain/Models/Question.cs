namespace Web3D.Domain.Models;

public class Question
{
    public long Id { get; set; }
    public long TestId { get; set; }
    public int Index { get; set; }
    public string Text { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public ICollection<AnswerOption> AnswerOptions { get; set; } = [];
}
