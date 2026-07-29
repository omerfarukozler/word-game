using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using WordBattle.Application.Interfaces;

namespace WordBattle.Infrastructure.Words;

public sealed class DatabaseWordProvider(IGameDbContext dbContext) : IWordProvider
{
    public async Task<string> GetRandomWordAsync(
        int length,
        CancellationToken cancellationToken = default)
    {
        if (length <= 0)
        {
            throw new ArgumentOutOfRangeException(
                nameof(length),
                length,
                "Word length must be greater than zero.");
        }

        var words = await dbContext.GameWords
            .AsNoTracking()
            .Where(gameWord =>
                gameWord.IsActive &&
                gameWord.CanBeTarget &&
                gameWord.Length == length)
            .Select(gameWord => gameWord.Text)
            .ToListAsync(cancellationToken);

        if (words.Count == 0)
        {
            throw new InvalidOperationException(
                $"No active target words were found with length {length}.");
        }

        var index = RandomNumberGenerator.GetInt32(words.Count);

        return words[index];
    }
}
