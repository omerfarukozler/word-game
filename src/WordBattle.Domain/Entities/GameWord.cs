namespace WordBattle.Domain.Entities;

public sealed class GameWord
{
    public Guid Id { get; set; }

    public string Text { get; set; } = string.Empty;

    public int Length { get; set; }

    public bool IsActive { get; set; }

    public bool CanBeTarget { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? Frequency { get; set; }

    public int? FrequencyRank { get; set; }

    public string? Source { get; set; }
}
