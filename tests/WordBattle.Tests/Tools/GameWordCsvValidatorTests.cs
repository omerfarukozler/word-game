using WordBattle.DataImporter.Import;
using WordBattle.DataImporter.Validation;

namespace WordBattle.Tests.Tools;

public sealed class GameWordCsvValidatorTests : IDisposable
{
    private readonly string _directory = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString("N"));

    public GameWordCsvValidatorTests()
    {
        Directory.CreateDirectory(_directory);
    }

    public void Dispose()
    {
        Directory.Delete(_directory, recursive: true);
    }

    [Fact]
    public void Validate_AcceptsValidCsv()
    {
        var id = Guid.NewGuid();
        var gamePath = WriteCsv("game.csv", Rows(Row(id, "incir", canBeTarget: true)));
        var targetPath = WriteCsv("target.csv", Rows(Row(id, "İNCİR", canBeTarget: true)));

        var result = new GameWordCsvValidator().Validate(gamePath, targetPath);

        Assert.True(result.Success);
        Assert.Equal("İNCİR", result.GameWords.Single().Text);
    }

    [Fact]
    public void Validate_RejectsDuplicateGameWord()
    {
        var id = Guid.NewGuid();
        var gamePath = WriteCsv("game.csv", Rows(Row(id, "İNCİR"), Row(Guid.NewGuid(), "incir")));
        var targetPath = WriteCsv("target.csv", Rows(Row(id, "İNCİR", canBeTarget: true)));

        var result = new GameWordCsvValidator().Validate(gamePath, targetPath);

        Assert.False(result.Success);
        Assert.Contains(result.Errors, error => error.Contains("duplicate Text 'İNCİR'", StringComparison.Ordinal));
    }

    [Theory]
    [InlineData("")]
    [InlineData("     ")]
    public void Validate_RejectsEmptyText(string text)
    {
        var gamePath = WriteCsv("game.csv", Rows(Row(Guid.NewGuid(), text)));
        var targetPath = WriteCsv("target.csv", Rows());

        var result = new GameWordCsvValidator().Validate(gamePath, targetPath);

        Assert.False(result.Success);
        Assert.Contains(result.Errors, error => error.Contains("Text is empty", StringComparison.Ordinal));
    }

    [Fact]
    public void Validate_RejectsNonFiveLetterText()
    {
        var gamePath = WriteCsv("game.csv", Rows(Row(Guid.NewGuid(), "FINDIK", length: 6)));
        var targetPath = WriteCsv("target.csv", Rows());

        var result = new GameWordCsvValidator().Validate(gamePath, targetPath);

        Assert.False(result.Success);
        Assert.Contains(result.Errors, error => error.Contains("expected 5", StringComparison.Ordinal));
    }

    [Fact]
    public void Validate_RejectsLengthMismatch()
    {
        var gamePath = WriteCsv("game.csv", Rows(Row(Guid.NewGuid(), "İNCİR", length: 4)));
        var targetPath = WriteCsv("target.csv", Rows());

        var result = new GameWordCsvValidator().Validate(gamePath, targetPath);

        Assert.False(result.Success);
        Assert.Contains(result.Errors, error => error.Contains("expected 4", StringComparison.Ordinal));
    }

    [Fact]
    public void Validate_RejectsInvalidGuid()
    {
        var gamePath = WriteCsv("game.csv", Rows("not-a-guid,İNCİR,5,true,true,2026-08-02T00:00:00Z,,,test"));
        var targetPath = WriteCsv("target.csv", Rows());

        var result = new GameWordCsvValidator().Validate(gamePath, targetPath);

        Assert.False(result.Success);
        Assert.Contains(result.Errors, error => error.Contains("Id is not a valid Guid", StringComparison.Ordinal));
    }

    [Fact]
    public void Validate_RejectsInvalidBool()
    {
        var gamePath = WriteCsv("game.csv", Rows($"{Guid.NewGuid()},İNCİR,5,yes,true,2026-08-02T00:00:00Z,,,test"));
        var targetPath = WriteCsv("target.csv", Rows());

        var result = new GameWordCsvValidator().Validate(gamePath, targetPath);

        Assert.False(result.Success);
        Assert.Contains(result.Errors, error => error.Contains("IsActive is not a valid bool", StringComparison.Ordinal));
    }

    [Fact]
    public void Validate_RejectsInvalidNullableNumeric()
    {
        var gamePath = WriteCsv("game.csv", Rows($"{Guid.NewGuid()},İNCİR,5,true,true,2026-08-02T00:00:00Z,abc,,test"));
        var targetPath = WriteCsv("target.csv", Rows());

        var result = new GameWordCsvValidator().Validate(gamePath, targetPath);

        Assert.False(result.Success);
        Assert.Contains(result.Errors, error => error.Contains("Frequency is not a valid integer", StringComparison.Ordinal));
    }

    [Fact]
    public void Validate_RejectsMissingTargetWord()
    {
        var gamePath = WriteCsv("game.csv", Rows(Row(Guid.NewGuid(), "İNCİR", canBeTarget: true)));
        var targetPath = WriteCsv("target.csv", Rows(Row(Guid.NewGuid(), "BİLEK", canBeTarget: true)));

        var result = new GameWordCsvValidator().Validate(gamePath, targetPath);

        Assert.False(result.Success);
        Assert.Contains(result.Errors, error => error.Contains("does not exist in game words", StringComparison.Ordinal));
    }

    [Fact]
    public void Validate_RejectsTargetWhenGameWordIsNotTarget()
    {
        var id = Guid.NewGuid();
        var gamePath = WriteCsv("game.csv", Rows(Row(id, "İNCİR", canBeTarget: false)));
        var targetPath = WriteCsv("target.csv", Rows(Row(id, "İNCİR", canBeTarget: true)));

        var result = new GameWordCsvValidator().Validate(gamePath, targetPath);

        Assert.False(result.Success);
        Assert.Contains(result.Errors, error => error.Contains("CanBeTarget=true", StringComparison.Ordinal));
    }

    [Fact]
    public void Validate_RejectsTargetIdMismatch()
    {
        var gamePath = WriteCsv("game.csv", Rows(Row(Guid.NewGuid(), "İNCİR", canBeTarget: true)));
        var targetPath = WriteCsv("target.csv", Rows(Row(Guid.NewGuid(), "İNCİR", canBeTarget: true)));

        var result = new GameWordCsvValidator().Validate(gamePath, targetPath);

        Assert.False(result.Success);
        Assert.Contains(result.Errors, error => error.Contains("Id for 'İNCİR' does not match", StringComparison.Ordinal));
    }

    private string WriteCsv(string fileName, string rows)
    {
        var path = Path.Combine(_directory, fileName);
        File.WriteAllText(
            path,
            "Id,Text,Length,IsActive,CanBeTarget,CreatedAt,Frequency,FrequencyRank,Source" +
            Environment.NewLine +
            rows);
        return path;
    }

    private static string Rows(params string[] rows)
    {
        return string.Join(Environment.NewLine, rows);
    }

    private static string Row(
        Guid id,
        string text,
        int length = 5,
        bool isActive = true,
        bool canBeTarget = true)
    {
        return $"{id},{text},{length},{isActive},{canBeTarget},2026-08-02T00:00:00Z,10,1,test";
    }
}
