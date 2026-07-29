using WordBattle.Application.Models;

namespace WordBattle.Application.Dtos.Notifications;

public sealed class GuessSubmittedNotification
{
    public Guid Id { get; set; }

    public Guid MatchId { get; set; }

    public Guid PlayerId { get; set; }

    public string Word { get; set; } = string.Empty;

    public int AttemptNumber { get; set; }

    public IReadOnlyList<GuessLetterEvaluation> Evaluation { get; set; }
        = Array.Empty<GuessLetterEvaluation>();

    public DateTime SubmittedAt { get; set; }
}
