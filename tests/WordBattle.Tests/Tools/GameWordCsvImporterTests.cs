using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using WordBattle.DataImporter.Import;
using WordBattle.Domain.Entities;
using WordBattle.Infrastructure.Persistence;

namespace WordBattle.Tests.Tools;

public sealed class GameWordCsvImporterTests
{
    [Fact]
    public async Task ImportAsync_InsertsNewWord()
    {
        await using var dbContext = CreateDbContext();
        var importer = new GameWordCsvImporter(dbContext);

        var result = await importer.ImportAsync(
            [Row("İNCİR")],
            Options(dryRun: false));

        Assert.Equal(1, result.Inserted);
        Assert.Equal("İNCİR", await dbContext.GameWords.Select(word => word.Text).SingleAsync());
    }

    [Fact]
    public async Task ImportAsync_UpdatesExistingWordWithoutChangingIdOrCreatedAt()
    {
        await using var dbContext = CreateDbContext();
        var id = Guid.NewGuid();
        var createdAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        dbContext.GameWords.Add(new GameWord
        {
            Id = id,
            Text = "İNCİR",
            Length = 5,
            IsActive = true,
            CanBeTarget = false,
            CreatedAt = createdAt
        });
        await dbContext.SaveChangesAsync();

        var importer = new GameWordCsvImporter(dbContext);
        var result = await importer.ImportAsync(
            [Row("İNCİR", canBeTarget: true, frequency: 42)],
            Options(dryRun: false));

        var word = await dbContext.GameWords.SingleAsync();
        Assert.Equal(1, result.Updated);
        Assert.Equal(id, word.Id);
        Assert.Equal(createdAt, word.CreatedAt);
        Assert.True(word.CanBeTarget);
        Assert.Equal(42, word.Frequency);
    }

    [Fact]
    public async Task ImportAsync_IsIdempotent()
    {
        await using var dbContext = CreateDbContext();
        var importer = new GameWordCsvImporter(dbContext);
        var rows = new[] { Row("İNCİR") };

        await importer.ImportAsync(rows, Options(dryRun: false));
        var result = await importer.ImportAsync(rows, Options(dryRun: false));

        Assert.Equal(0, result.Inserted);
        Assert.Equal(0, result.Updated);
        Assert.Equal(1, result.Unchanged);
        Assert.Equal(1, await dbContext.GameWords.CountAsync());
    }

    [Fact]
    public async Task ImportAsync_DoesNotDeleteDatabaseOnlyWordsByDefault()
    {
        await using var dbContext = CreateDbContext();
        dbContext.GameWords.Add(new GameWord
        {
            Id = Guid.NewGuid(),
            Text = "BİLEK",
            Length = 5,
            IsActive = true,
            CanBeTarget = true,
            CreatedAt = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var importer = new GameWordCsvImporter(dbContext);
        await importer.ImportAsync([Row("İNCİR")], Options(dryRun: false));

        Assert.Equal(2, await dbContext.GameWords.CountAsync());
    }

    [Fact]
    public async Task ImportAsync_DryRunDoesNotChangeDatabase()
    {
        await using var dbContext = CreateDbContext();
        var importer = new GameWordCsvImporter(dbContext);

        var result = await importer.ImportAsync(
            [Row("İNCİR")],
            Options(dryRun: true));

        Assert.Equal(1, result.Inserted);
        Assert.Equal(0, await dbContext.GameWords.CountAsync());
    }

    private static GameDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<GameDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        return new GameDbContext(options);
    }

    private static GameWordImportOptions Options(bool dryRun)
    {
        return new GameWordImportOptions(
            Directory.GetCurrentDirectory(),
            "game.csv",
            "target.csv",
            dryRun,
            DeactivateMissing: false);
    }

    private static GameWordCsvRow Row(
        string text,
        bool canBeTarget = true,
        int? frequency = null)
    {
        return new GameWordCsvRow(
            RowNumber: 2,
            Id: Guid.NewGuid(),
            Text: text,
            Length: 5,
            IsActive: true,
            CanBeTarget: canBeTarget,
            CreatedAt: DateTime.UtcNow,
            Frequency: frequency,
            FrequencyRank: null,
            Source: "test");
    }
}
