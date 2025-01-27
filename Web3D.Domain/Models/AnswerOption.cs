namespace Web3D.Domain.Models;

public class AnswerOption
{
    public long Id { get; set; }
    public long QuestionId { get; set; }
    public int Index { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}
