using WordBattle.Application.Interfaces;
using WordBattle.Application.Models;
using WordBattle.Domain.Enums;

namespace WordBattle.Application.Services;

public sealed class GuessEvaluator : IGuessEvaluator
{
    public IReadOnlyList<GuessLetterEvaluation> Evaluate(
        string targetWord,
        string guessedWord)
    {
        ArgumentNullException.ThrowIfNull(targetWord);
        ArgumentNullException.ThrowIfNull(guessedWord);

        if (string.IsNullOrWhiteSpace(targetWord))
        {
            throw new ArgumentException(
                "Target word is required.",
                nameof(targetWord));
        }

        if (string.IsNullOrWhiteSpace(guessedWord))
        {
            throw new ArgumentException(
                "Guessed word is required.",
                nameof(guessedWord));
        }

        if (targetWord.Length != guessedWord.Length)
        {
            throw new ArgumentException(
                "Target word and guessed word must have the same length.");
        }

        var statuses = new GuessLetterStatus?[guessedWord.Length];
        var remainingLetters = new Dictionary<char, int>();

        for (var index = 0; index < guessedWord.Length; index++)
        {
            if (targetWord[index] == guessedWord[index])
            {
                statuses[index] = GuessLetterStatus.Correct;
                continue;
            }

            var targetLetter = targetWord[index];

            remainingLetters[targetLetter] =
                remainingLetters.GetValueOrDefault(targetLetter) + 1;
        }

        for (var index = 0; index < guessedWord.Length; index++)
        {
            if (statuses[index] == GuessLetterStatus.Correct)
            {
                continue;
            }

            var guessedLetter = guessedWord[index];

            if (remainingLetters.TryGetValue(guessedLetter, out var count) &&
                count > 0)
            {
                statuses[index] = GuessLetterStatus.Present;
                remainingLetters[guessedLetter] = count - 1;
            }
            else
            {
                statuses[index] = GuessLetterStatus.Absent;
            }
        }

        return Enumerable
            .Range(0, guessedWord.Length)
            .Select(index => new GuessLetterEvaluation(
                index,
                guessedWord[index],
                statuses[index]!.Value))
            .ToArray();
    }
}
