using WordBattle.Application.Models;

namespace WordBattle.Application.Interfaces;

public interface IGuessEvaluator
{
    IReadOnlyList<GuessLetterEvaluation> Evaluate(
        string targetWord,
        string guessedWord);
}
