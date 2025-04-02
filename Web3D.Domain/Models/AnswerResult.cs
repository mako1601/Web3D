namespace Web3D.Domain.Models;

public class AnswerResult
{
    public long Id { get; set; }
    public long TestResultId { get; set; }
    public long QuestionId { get; set; }
    public bool IsCorrect { get; set; }
}
