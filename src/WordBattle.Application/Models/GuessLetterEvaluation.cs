using WordBattle.Domain.Enums;

namespace WordBattle.Application.Models;

public sealed record GuessLetterEvaluation(
    int Position,
    char Letter,
    GuessLetterStatus Status);
