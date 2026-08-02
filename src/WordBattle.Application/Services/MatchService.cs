using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WordBattle.Application.Dtos.Notifications;
using WordBattle.Application.Dtos.Requests;
using WordBattle.Application.Dtos.Responses;
using WordBattle.Application.Exceptions;
using WordBattle.Application.Interfaces;
using WordBattle.Domain.Entities;
using WordBattle.Domain;
using WordBattle.Domain.Enums;

namespace WordBattle.Application.Services;

public sealed class MatchService(IGameDbContext dbContext, IGuessEvaluator guessEvaluator, IGameNotifier gameNotifier, ILogger<MatchService> logger) : IMatchService
{
    private static readonly CultureInfo TurkishCulture =
        CultureInfo.GetCultureInfo("tr-TR");

    public async Task<SubmitGuessResponse> SubmitGuessAsync(
        Guid matchId,
        SubmitGuessRequest request,
        CancellationToken cancellationToken = default)
    {
        if (matchId == Guid.Empty)
        {
            throw new BusinessRuleException("Match id is required.");
        }

        ArgumentNullException.ThrowIfNull(request);

        if (string.IsNullOrWhiteSpace(request.PlayerToken))
        {
            throw new BusinessRuleException("Player token is required.");
        }

        var playerToken = request.PlayerToken.Trim();

        if (string.IsNullOrWhiteSpace(request.Word))
        {
            throw new BusinessRuleException("Guess word is required.");
        }

        var match = await dbContext.Matches
            .Include(match => match.Room)
                .ThenInclude(room => room.Players)
            .FirstOrDefaultAsync(
                match => match.Id == matchId,
                cancellationToken);

        if (match is null)
        {
            throw new NotFoundException("Match not found.");
        }

        if (match.Status != MatchStatus.Playing)
        {
            throw new BusinessRuleException("The match is not currently active.");
        }

        if (match.Room.Status != RoomStatus.Playing)
        {
            throw new BusinessRuleException("The room is not currently playing.");
        }

        var player = match.Room.Players.FirstOrDefault(
            player => player.PlayerToken == playerToken);

        if (player is null)
        {
            throw new BusinessRuleException("Invalid player token.");
        }

        var submittedAt = DateTime.UtcNow;

        if (match.ExpiresAt.HasValue && submittedAt >= match.ExpiresAt.Value)
        {
            match.Status = MatchStatus.Completed;
            match.WinnerPlayerId = null;
            match.CompletedAt = submittedAt;
            match.CompletionReason = MatchCompletionReason.TimeExpired;
            match.Room.Status = RoomStatus.Ready;

            await dbContext.SaveChangesAsync(cancellationToken);

            await NotifyMatchCompletedAsync(
                match.Room.Code,
                CreateMatchCompletedNotification(match),
                cancellationToken);

            throw new BusinessRuleException("The match time has expired.");
        }

        var previousAttemptCount = await dbContext.Guesses
            .AsNoTracking()
            .CountAsync(
                guess =>
                    guess.MatchId == match.Id &&
                    guess.PlayerId == player.Id,
                cancellationToken);

        if (previousAttemptCount >= GameRules.MaximumAttemptsPerPlayer)
        {
            throw new BusinessRuleException("Maximum guess attempts reached.");
        }

        var normalizedWord = request.Word
            .Trim()
            .ToUpper(TurkishCulture);

        if (normalizedWord.Length != 5)
        {
            throw new BusinessRuleException(
                "Guess word must contain exactly 5 characters.");
        }

        var isValidWord = await dbContext.GameWords
            .AsNoTracking()
            .AnyAsync(
                gameWord =>
                    gameWord.Text == normalizedWord &&
                    gameWord.IsActive &&
                    gameWord.Length == 5,
                cancellationToken);

        if (!isValidWord)
        {
            throw new BusinessRuleException(
                "The guessed word is not in the word list.");
        }

        if (string.IsNullOrWhiteSpace(match.TargetWord))
        {
            throw new InvalidOperationException(
                "The active match does not have a target word.");
        }

        var evaluation = guessEvaluator.Evaluate(
            match.TargetWord,
            normalizedWord);

        var isCorrect = evaluation.All(
            item => item.Status == GuessLetterStatus.Correct);

        var attemptNumber = previousAttemptCount + 1;

        var guess = new Guess
        {
            Id = Guid.NewGuid(),
            MatchId = match.Id,
            PlayerId = player.Id,
            Word = normalizedWord,
            AttemptNumber = attemptNumber,
            CreatedAt = submittedAt
        };

        dbContext.Guesses.Add(guess);

        if (isCorrect)
        {
            match.Status = MatchStatus.Completed;
            match.WinnerPlayerId = player.Id;
            match.CompletedAt = submittedAt;
            match.CompletionReason = MatchCompletionReason.CorrectGuess;
            match.Room.Status = RoomStatus.Ready;
        }
        else if (attemptNumber == GameRules.MaximumAttemptsPerPlayer)
        {
            var winner = match.Room.Players.SingleOrDefault(
                roomPlayer => roomPlayer.Id != player.Id);

            if (winner is null || match.Room.Players.Count != 2)
            {
                throw new InvalidOperationException(
                    "Attempt limit completion requires exactly two room players.");
            }

            match.Status = MatchStatus.Completed;
            match.WinnerPlayerId = winner.Id;
            match.CompletedAt = submittedAt;
            match.CompletionReason = MatchCompletionReason.AttemptLimit;
            match.Room.Status = RoomStatus.Ready;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        var isMatchCompleted = match.Status == MatchStatus.Completed;
        var completionReason = isMatchCompleted ? match.CompletionReason : null;

        var response = new SubmitGuessResponse
        {
            Id = guess.Id,
            MatchId = guess.MatchId,
            PlayerId = guess.PlayerId,
            Word = guess.Word,
            AttemptNumber = guess.AttemptNumber,
            Evaluation = evaluation,
            IsCorrect = isCorrect,
            IsMatchCompleted = isMatchCompleted,
            WinnerPlayerId = isMatchCompleted ? match.WinnerPlayerId : null,
            TargetWord = isMatchCompleted ? match.TargetWord : null,
            CompletionReason = completionReason,
            IsDraw = match.WinnerPlayerId is null &&
                completionReason == MatchCompletionReason.TimeExpired,
            SubmittedAt = guess.CreatedAt
        };

        try
        {
            await gameNotifier.GuessSubmittedAsync(
                match.Room.Code,
                new GuessSubmittedNotification
                {
                    Id = response.Id,
                    MatchId = response.MatchId,
                    PlayerId = response.PlayerId,
                    Word = response.Word,
                    AttemptNumber = response.AttemptNumber,
                    Evaluation = response.Evaluation,
                    SubmittedAt = response.SubmittedAt
                },
                cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "GuessSubmitted notification could not be sent for room {RoomCode}, match {MatchId}, guess {GuessId}",
                match.Room.Code,
                guess.MatchId,
                guess.Id);
        }

        if (isMatchCompleted)
        {
            await NotifyMatchCompletedAsync(
                match.Room.Code,
                CreateMatchCompletedNotification(match),
                cancellationToken);
        }

        return response;
    }

    private async Task NotifyMatchCompletedAsync(
        string roomCode,
        MatchCompletedNotification notification,
        CancellationToken cancellationToken)
    {
        try
        {
            await gameNotifier.MatchCompletedAsync(
                roomCode,
                notification,
                cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "MatchCompleted notification could not be sent for room {RoomCode}, match {MatchId}",
                roomCode,
                notification.MatchId);
        }
    }

    private static MatchCompletedNotification CreateMatchCompletedNotification(
        GameMatch match)
    {
        if (!match.CompletedAt.HasValue || !match.CompletionReason.HasValue)
        {
            throw new InvalidOperationException(
                "Completed match notification requires completion data.");
        }

        return new MatchCompletedNotification
        {
            MatchId = match.Id,
            WinnerPlayerId = match.WinnerPlayerId,
            TargetWord = match.TargetWord,
            CompletedAt = match.CompletedAt.Value,
            CompletionReason = match.CompletionReason.Value,
            IsDraw = match.WinnerPlayerId is null &&
                match.CompletionReason == MatchCompletionReason.TimeExpired
        };
    }
}
