using WordBattle.Application.Services;
using WordBattle.Domain.Enums;

namespace WordBattle.Tests.Application.Services;

public sealed class GuessEvaluatorTests
{
    [Fact]
    public void Evaluate_WhenTargetWordIsNull_ShouldThrowArgumentNullException()
    {
        var evaluator = new GuessEvaluator();

        Assert.Throws<ArgumentNullException>(() =>
            evaluator.Evaluate(null!, "ELMAS"));
    }

    [Fact]
    public void Evaluate_WhenGuessedWordIsNull_ShouldThrowArgumentNullException()
    {
        var evaluator = new GuessEvaluator();

        Assert.Throws<ArgumentNullException>(() =>
            evaluator.Evaluate("ELMAS", null!));
    }

    [Fact]
    public void Evaluate_WhenTargetWordIsEmpty_ShouldThrowArgumentException()
    {
        var evaluator = new GuessEvaluator();

        Assert.Throws<ArgumentException>(() =>
            evaluator.Evaluate(string.Empty, "ELMAS"));
    }

    [Fact]
    public void Evaluate_WhenGuessedWordIsWhitespace_ShouldThrowArgumentException()
    {
        var evaluator = new GuessEvaluator();

        Assert.Throws<ArgumentException>(() =>
            evaluator.Evaluate("ELMAS", "     "));
    }

    [Fact]
    public void Evaluate_WhenWordLengthsAreDifferent_ShouldThrowArgumentException()
    {
        var evaluator = new GuessEvaluator();

        Assert.Throws<ArgumentException>(() =>
            evaluator.Evaluate("ELMAS", "KEDİ"));
    }

    [Fact]
    public void Evaluate_WhenAllLettersAreCorrect_ShouldMarkAllLettersAsCorrect()
    {
        var evaluator = new GuessEvaluator();

        var result = evaluator.Evaluate("ELMAS", "ELMAS");

        AssertEvaluation(
            result,
            "ELMAS",
            GuessLetterStatus.Correct,
            GuessLetterStatus.Correct,
            GuessLetterStatus.Correct,
            GuessLetterStatus.Correct,
            GuessLetterStatus.Correct);
    }

    [Fact]
    public void Evaluate_WhenNoLettersExistInTarget_ShouldMarkAllLettersAsAbsent()
    {
        var evaluator = new GuessEvaluator();

        var result = evaluator.Evaluate("ELMAS", "BÖRÜK");

        AssertEvaluation(
            result,
            "BÖRÜK",
            GuessLetterStatus.Absent,
            GuessLetterStatus.Absent,
            GuessLetterStatus.Absent,
            GuessLetterStatus.Absent,
            GuessLetterStatus.Absent);
    }

    [Fact]
    public void Evaluate_WhenLettersExistInDifferentPositions_ShouldMarkThemAsPresent()
    {
        var evaluator = new GuessEvaluator();

        var result = evaluator.Evaluate("ÇİÇEK", "ÇEKİÇ");

        AssertEvaluation(
            result,
            "ÇEKİÇ",
            GuessLetterStatus.Correct,
            GuessLetterStatus.Present,
            GuessLetterStatus.Present,
            GuessLetterStatus.Present,
            GuessLetterStatus.Present);
    }

    [Fact]
    public void Evaluate_WhenGuessContainsMoreOccurrencesThanTarget_ShouldMarkExtraLettersAsAbsent()
    {
        var evaluator = new GuessEvaluator();

        var result = evaluator.Evaluate("ELMAS", "ELLER");

        AssertEvaluation(
            result,
            "ELLER",
            GuessLetterStatus.Correct,
            GuessLetterStatus.Correct,
            GuessLetterStatus.Absent,
            GuessLetterStatus.Absent,
            GuessLetterStatus.Absent);
    }

    [Fact]
    public void Evaluate_WhenCorrectLettersConsumeTargetOccurrences_ShouldEvaluateRemainingLettersAfterCorrectPass()
    {
        var evaluator = new GuessEvaluator();

        var result = evaluator.Evaluate("KAVAK", "KAKAO");

        AssertEvaluation(
            result,
            "KAKAO",
            GuessLetterStatus.Correct,
            GuessLetterStatus.Correct,
            GuessLetterStatus.Present,
            GuessLetterStatus.Correct,
            GuessLetterStatus.Absent);
    }

    [Fact]
    public void Evaluate_WhenTargetContainsRepeatedLetters_ShouldConsumeOnlyRemainingOccurrences()
    {
        var evaluator = new GuessEvaluator();

        var result = evaluator.Evaluate("KAVAK", "AKKAK");

        AssertEvaluation(
            result,
            "AKKAK",
            GuessLetterStatus.Present,
            GuessLetterStatus.Present,
            GuessLetterStatus.Absent,
            GuessLetterStatus.Correct,
            GuessLetterStatus.Correct);
    }

    [Fact]
    public void Evaluate_ShouldReturnZeroBasedPositions()
    {
        var evaluator = new GuessEvaluator();

        var result = evaluator.Evaluate("ELMAS", "ELMAS");

        Assert.Equal([0, 1, 2, 3, 4], result.Select(item => item.Position));
    }

    [Fact]
    public void Evaluate_ShouldReturnLettersFromGuessedWord()
    {
        var evaluator = new GuessEvaluator();

        var result = evaluator.Evaluate("ELMAS", "KALEM");

        Assert.Equal(['K', 'A', 'L', 'E', 'M'], result.Select(item => item.Letter));
    }

    [Fact]
    public void Evaluate_ShouldKeepResultOrderSameAsGuessedWord()
    {
        var evaluator = new GuessEvaluator();

        var result = evaluator.Evaluate("ELMAS", "KALEM");

        Assert.Equal("KALEM", new string(result.Select(item => item.Letter).ToArray()));
    }

    [Fact]
    public void Evaluate_WhenCalledTwiceWithSameInput_ShouldReturnSameResult()
    {
        var evaluator = new GuessEvaluator();

        var firstResult = evaluator.Evaluate("KAVAK", "KAKAO");
        var secondResult = evaluator.Evaluate("KAVAK", "KAKAO");

        Assert.Equal(firstResult, secondResult);
    }

    private static void AssertEvaluation(
        IReadOnlyList<WordBattle.Application.Models.GuessLetterEvaluation> result,
        string guessedWord,
        params GuessLetterStatus[] statuses)
    {
        Assert.Equal(guessedWord.Length, result.Count);
        Assert.Equal(statuses.Length, result.Count);

        for (var index = 0; index < result.Count; index++)
        {
            Assert.Equal(index, result[index].Position);
            Assert.Equal(guessedWord[index], result[index].Letter);
            Assert.Equal(statuses[index], result[index].Status);
        }
    }
}
