namespace WordBattle.Application.Interfaces;

public interface IWordProvider
{
    Task<string> GetRandomWordAsync(
        int length,
        CancellationToken cancellationToken = default);
}
