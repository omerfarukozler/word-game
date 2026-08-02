using Microsoft.EntityFrameworkCore;
using WordBattle.Domain.Entities;
using WordBattle.Infrastructure.Persistence;

namespace WordBattle.DataImporter.Import;

public sealed class GameWordCsvImporter(GameDbContext dbContext)
{
    public async Task<GameWordImportResult> ImportAsync(
        IReadOnlyCollection<GameWordCsvRow> rows,
        GameWordImportOptions options,
        CancellationToken cancellationToken = default)
    {
        var existingWords = await dbContext.GameWords
            .ToListAsync(cancellationToken);
        var existingByText = existingWords.ToDictionary(word => word.Text, StringComparer.Ordinal);
        var csvTexts = rows.Select(row => row.Text).ToHashSet(StringComparer.Ordinal);

        var result = new GameWordImportResult
        {
            TotalRows = rows.Count,
            ExistingRecords = existingWords.Count
        };

        foreach (var row in rows)
        {
            if (!existingByText.TryGetValue(row.Text, out var existing))
            {
                dbContext.GameWords.Add(new GameWord
                {
                    Id = row.Id,
                    Text = row.Text,
                    Length = row.Length,
                    IsActive = row.IsActive,
                    CanBeTarget = row.CanBeTarget,
                    CreatedAt = row.CreatedAt ?? DateTime.UtcNow,
                    Frequency = row.Frequency,
                    FrequencyRank = row.FrequencyRank,
                    Source = row.Source
                });
                result.Inserted++;
                continue;
            }

            if (ApplyUpdates(existing, row))
            {
                result.Updated++;
            }
            else
            {
                result.Unchanged++;
            }
        }

        if (options.DeactivateMissing)
        {
            foreach (var existing in existingWords.Where(word => !csvTexts.Contains(word.Text) && word.IsActive))
            {
                existing.IsActive = false;
                result.Deactivated++;
            }
        }

        result.ActiveWords = rows.Count(row => row.IsActive);
        result.TargetWords = rows.Count(row => row.IsActive && row.CanBeTarget && row.Length == 5);
        result.NonTargetWords = rows.Count(row => row.IsActive && !row.CanBeTarget);

        if (options.DryRun)
        {
            return result;
        }

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return result;
    }

    private static bool ApplyUpdates(GameWord existing, GameWordCsvRow row)
    {
        var changed = false;

        changed |= UpdateIfChanged(existing.Length, row.Length, value => existing.Length = value);
        changed |= UpdateIfChanged(existing.IsActive, row.IsActive, value => existing.IsActive = value);
        changed |= UpdateIfChanged(existing.CanBeTarget, row.CanBeTarget, value => existing.CanBeTarget = value);
        changed |= UpdateIfChanged(existing.Frequency, row.Frequency, value => existing.Frequency = value);
        changed |= UpdateIfChanged(existing.FrequencyRank, row.FrequencyRank, value => existing.FrequencyRank = value);
        changed |= UpdateIfChanged(existing.Source, row.Source, value => existing.Source = value);

        return changed;
    }

    private static bool UpdateIfChanged<T>(T current, T next, Action<T> apply)
    {
        if (EqualityComparer<T>.Default.Equals(current, next))
        {
            return false;
        }

        apply(next);
        return true;
    }
}
