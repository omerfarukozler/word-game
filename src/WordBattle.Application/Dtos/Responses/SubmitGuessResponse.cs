using WordBattle.Application.Models;

namespace WordBattle.Application.Dtos.Responses;

public sealed class SubmitGuessResponse
{
    public Guid Id { get; set; }

    public Guid MatchId { get; set; }

    public Guid PlayerId { get; set; }

    public string Word { get; set; } = string.Empty;

    public int AttemptNumber { get; set; }

    public IReadOnlyList<GuessLetterEvaluation> Evaluation { get; set; }
        = Array.Empty<GuessLetterEvaluation>();

    public bool IsCorrect { get; set; }

    public bool IsMatchCompleted { get; set; }

    public Guid? WinnerPlayerId { get; set; }

    public DateTime SubmittedAt { get; set; }
}
