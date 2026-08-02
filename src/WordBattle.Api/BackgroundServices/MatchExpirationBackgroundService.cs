using Microsoft.EntityFrameworkCore;
using WordBattle.Application.Dtos.Notifications;
using WordBattle.Application.Interfaces;
using WordBattle.Domain.Enums;

namespace WordBattle.Api.BackgroundServices;

public sealed class MatchExpirationBackgroundService(
    IServiceScopeFactory scopeFactory,
    ILogger<MatchExpirationBackgroundService> logger) : BackgroundService
{
    private static readonly TimeSpan CheckInterval = TimeSpan.FromSeconds(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(CheckInterval);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CompleteExpiredMatchesAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Expired match processing failed.");
            }

            try
            {
                await timer.WaitForNextTickAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }

    private async Task CompleteExpiredMatchesAsync(CancellationToken cancellationToken)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<IGameDbContext>();
        var gameNotifier = scope.ServiceProvider.GetRequiredService<IGameNotifier>();
        var now = DateTime.UtcNow;

        var expiredMatches = await dbContext.Matches
            .Include(match => match.Room)
            .Where(match =>
                match.Status == MatchStatus.Playing &&
                match.ExpiresAt.HasValue &&
                match.ExpiresAt <= now)
            .ToListAsync(cancellationToken);

        foreach (var match in expiredMatches)
        {
            match.Status = MatchStatus.Completed;
            match.WinnerPlayerId = null;
            match.CompletedAt = now;
            match.CompletionReason = MatchCompletionReason.TimeExpired;
            match.Room.Status = RoomStatus.Ready;
        }

        if (expiredMatches.Count == 0)
        {
            return;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        foreach (var match in expiredMatches)
        {
            try
            {
                await gameNotifier.MatchCompletedAsync(
                    match.Room.Code,
                    new MatchCompletedNotification
                    {
                        MatchId = match.Id,
                        WinnerPlayerId = null,
                        CompletedAt = match.CompletedAt!.Value,
                        CompletionReason = MatchCompletionReason.TimeExpired,
                        IsDraw = true
                    },
                    cancellationToken);
            }
            catch (Exception exception)
            {
                logger.LogError(
                    exception,
                    "MatchCompleted notification could not be sent for room {RoomCode}, match {MatchId}",
                    match.Room.Code,
                    match.Id);
            }
        }
    }
}
