using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WordBattle.Application.Dtos.Notifications;
using WordBattle.Application.Dtos.Requests;
using WordBattle.Application.Dtos.Responses;
using WordBattle.Application.Exceptions;
using WordBattle.Application.Interfaces;
using WordBattle.Domain;
using WordBattle.Domain.Entities;
using WordBattle.Domain.Enums;

namespace WordBattle.Application.Services;

public sealed class RoomService(
    IGameDbContext dbContext,
    IGameNotifier gameNotifier,
    IWordProvider wordProvider,
    ILogger<RoomService> logger) : IRoomService
{
    private const string RoomCodeCharacters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private const int RoomCodeLength = 6;
    private const int MaxRoomCodeGenerationAttempts = 10;

    public async Task<CreateRoomResponse> CreateAsync(
        CreateRoomRequest request,
        CancellationToken cancellationToken = default)
    {
        var room = new Room
        {
            Id = Guid.NewGuid(),
            Code = await GenerateUniqueRoomCodeAsync(cancellationToken),
            Status = RoomStatus.WaitingForPlayer,
            CreatedAt = DateTime.UtcNow,
            ClosedAt = null
        };

        var hostPlayer = new RoomPlayer
        {
            Id = Guid.NewGuid(),
            RoomId = room.Id,
            Nickname = request.Nickname.Trim(),
            PlayerToken = GeneratePlayerToken(),
            Score = 0,
            IsReady = false,
            IsConnected = false,
            IsHost = true
        };

        room.Players.Add(hostPlayer);
        dbContext.Rooms.Add(room);

        await dbContext.SaveChangesAsync(cancellationToken);

        return new CreateRoomResponse
        {
            RoomId = room.Id,
            Code = room.Code,
            PlayerId = hostPlayer.Id,
            PlayerToken = hostPlayer.PlayerToken,
            IsHost = true
        };
    }

    public async Task<JoinRoomResponse> JoinAsync(
        string code,
        JoinRoomRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new BusinessRuleException("Room code is required.");
        }

        code = code.Trim().ToUpperInvariant();
        var nickname = request.Nickname.Trim();

        var room = await dbContext.Rooms
            .Include(room => room.Players)
            .FirstOrDefaultAsync(room => room.Code == code, cancellationToken);

        if (room is null)
        {
            throw new NotFoundException("Room not found.");
        }

        if (room.Status == RoomStatus.Closed)
        {
            throw new BusinessRuleException("Room is closed.");
        }

        if (room.Status == RoomStatus.Playing)
        {
            throw new BusinessRuleException("Game has already started.");
        }

        if (room.Players.Count >= 2)
        {
            throw new BusinessRuleException("Room is full.");
        }

        var nicknameExists = room.Players
            .Any(player => string.Equals(
                player.Nickname,
                nickname,
                StringComparison.OrdinalIgnoreCase));

        if (nicknameExists)
        {
            throw new BusinessRuleException("Nickname is already in use in this room.");
        }

        var newPlayer = new RoomPlayer
        {
            Id = Guid.NewGuid(),
            RoomId = room.Id,
            Nickname = nickname,
            PlayerToken = GeneratePlayerToken(),
            Score = 0,
            IsReady = false,
            IsConnected = false,
            IsHost = false
        };

        dbContext.RoomPlayers.Add(newPlayer);
        room.Status = RoomStatus.Ready;

        await dbContext.SaveChangesAsync(cancellationToken);

        try
        {
            var roomUpdated = await GetRoomForNotificationAsync(room.Code, cancellationToken);
            await gameNotifier.RoomUpdatedAsync(room.Code, roomUpdated, cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "RoomUpdated notification could not be sent for room {RoomCode}",
                room.Code);
        }

        return new JoinRoomResponse
        {
            RoomId = room.Id,
            Code = room.Code,
            PlayerId = newPlayer.Id,
            PlayerToken = newPlayer.PlayerToken
        };
    }

    public async Task<RoomResponse> GetAsync(
        string code,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new BusinessRuleException("Room code is required.");
        }

        code = code.Trim().ToUpperInvariant();

        var room = await dbContext.Rooms
            .AsNoTracking()
            .Include(room => room.Players)
            .Include(room => room.Matches)
            .FirstOrDefaultAsync(room => room.Code == code, cancellationToken);

        if (room is null)
        {
            throw new NotFoundException("Room not found.");
        }

        return MapRoom(room);
    }

    public async Task<MatchResponse> StartAsync(
        string code,
        StartMatchRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new BusinessRuleException("Room code is required.");
        }

        if (string.IsNullOrWhiteSpace(request.PlayerToken))
        {
            throw new BusinessRuleException("Player token is required.");
        }

        code = code.Trim().ToUpperInvariant();
        var playerToken = request.PlayerToken.Trim();

        var room = await dbContext.Rooms
            .Include(room => room.Players)
            .Include(room => room.Matches)
            .FirstOrDefaultAsync(room => room.Code == code, cancellationToken);

        if (room is null)
        {
            throw new NotFoundException("Room not found.");
        }

        var player = room.Players.FirstOrDefault(player =>
            player.PlayerToken == playerToken);

        if (player is null)
        {
            throw new BusinessRuleException("Invalid player token.");
        }

        if (!player.IsHost)
        {
            throw new BusinessRuleException("Only the room host can start the match.");
        }

        if (room.Status == RoomStatus.Closed)
        {
            throw new BusinessRuleException("Room is closed.");
        }

        if (room.Status == RoomStatus.WaitingForPlayer)
        {
            throw new BusinessRuleException("The room is waiting for another player.");
        }

        if (room.Status == RoomStatus.Playing)
        {
            throw new BusinessRuleException("A match is already in progress.");
        }

        if (room.Status != RoomStatus.Ready)
        {
            throw new BusinessRuleException("The room is not ready to start.");
        }

        if (room.Players.Count != 2)
        {
            throw new BusinessRuleException("Exactly two players are required to start a match.");
        }

        var hasAnyMatch = await dbContext.Matches
            .AsNoTracking()
            .AnyAsync(match => match.RoomId == room.Id, cancellationToken);

        if (hasAnyMatch)
        {
            throw new BusinessRuleException(
                "A new match must be started through the rematch flow.");
        }

        var hasActiveMatch = room.Matches.Any(match =>
            match.Status == MatchStatus.Waiting ||
            match.Status == MatchStatus.Playing);

        if (hasActiveMatch)
        {
            throw new BusinessRuleException("An active match already exists in this room.");
        }

        var match = await CreatePlayingMatchAsync(room.Id, cancellationToken);
        dbContext.Matches.Add(match);
        room.Status = RoomStatus.Playing;

        await dbContext.SaveChangesAsync(cancellationToken);

        var response = MapMatch(match);

        try
        {
            await gameNotifier.MatchStartedAsync(room.Code, response, cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "MatchStarted notification could not be sent for room {RoomCode} and match {MatchId}",
                room.Code,
                match.Id);
        }

        return response;
    }

    public async Task<RematchRequestResponse> RequestRematchAsync(
        string code,
        RematchRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new BusinessRuleException("Room code is required.");
        }

        ArgumentNullException.ThrowIfNull(request);

        if (string.IsNullOrWhiteSpace(request.PlayerToken))
        {
            throw new BusinessRuleException("Player token is required.");
        }

        code = code.Trim().ToUpperInvariant();
        var playerToken = request.PlayerToken.Trim();

        var room = await GetRoomForRematchAsync(code, cancellationToken);
        var requester = ValidateRematchRequester(room, playerToken);

        if (room.RematchRequestedByPlayerId.HasValue)
        {
            throw new BusinessRuleException("A rematch request is already pending.");
        }

        var requestedAt = DateTime.UtcNow;

        room.RematchRequestedByPlayerId = requester.Id;
        room.RematchRequestedAt = requestedAt;

        await dbContext.SaveChangesAsync(cancellationToken);

        var response = new RematchRequestResponse
        {
            RequestedByPlayerId = requester.Id,
            RequestedAt = requestedAt
        };

        try
        {
            await gameNotifier.RematchRequestedAsync(
                room.Code,
                new RematchRequestedNotification
                {
                    RequestedByPlayerId = response.RequestedByPlayerId,
                    RequestedAt = response.RequestedAt
                },
                cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "RematchRequested notification could not be sent for room {RoomCode}",
                room.Code);
        }

        return response;
    }

    public async Task<RespondRematchResponse> RespondRematchAsync(
        string code,
        RespondRematchRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new BusinessRuleException("Room code is required.");
        }

        ArgumentNullException.ThrowIfNull(request);

        if (string.IsNullOrWhiteSpace(request.PlayerToken))
        {
            throw new BusinessRuleException("Player token is required.");
        }

        code = code.Trim().ToUpperInvariant();
        var playerToken = request.PlayerToken.Trim();

        var room = await GetRoomForRematchAsync(code, cancellationToken);
        var responder = ValidateRematchResponder(room, playerToken);
        var requestedByPlayerId = room.RematchRequestedByPlayerId!.Value;

        if (!request.Accept)
        {
            var rejectedAt = DateTime.UtcNow;

            room.RematchRequestedByPlayerId = null;
            room.RematchRequestedAt = null;

            await dbContext.SaveChangesAsync(cancellationToken);

            try
            {
                await gameNotifier.RematchRejectedAsync(
                    room.Code,
                    new RematchRejectedNotification
                    {
                        RequestedByPlayerId = requestedByPlayerId,
                        RejectedByPlayerId = responder.Id,
                        RejectedAt = rejectedAt
                    },
                    cancellationToken);
            }
            catch (Exception exception)
            {
                logger.LogError(
                    exception,
                    "RematchRejected notification could not be sent for room {RoomCode}",
                    room.Code);
            }

            return new RespondRematchResponse
            {
                Accepted = false,
                Match = null
            };
        }

        var match = await CreatePlayingMatchAsync(room.Id, cancellationToken);

        dbContext.Matches.Add(match);
        room.Status = RoomStatus.Playing;
        room.RematchRequestedByPlayerId = null;
        room.RematchRequestedAt = null;

        await dbContext.SaveChangesAsync(cancellationToken);

        var matchResponse = MapMatch(match);

        try
        {
            await gameNotifier.MatchStartedAsync(room.Code, matchResponse, cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "MatchStarted notification could not be sent for room {RoomCode} and match {MatchId}",
                room.Code,
                match.Id);
        }

        return new RespondRematchResponse
        {
            Accepted = true,
            Match = matchResponse
        };
    }

    private async Task<Room> GetRoomForRematchAsync(
        string code,
        CancellationToken cancellationToken)
    {
        var room = await dbContext.Rooms
            .Include(room => room.Players)
            .Include(room => room.Matches)
            .FirstOrDefaultAsync(room => room.Code == code, cancellationToken);

        if (room is null)
        {
            throw new NotFoundException("Room not found.");
        }

        if (room.Status != RoomStatus.Ready)
        {
            throw new BusinessRuleException("The room is not ready for rematch.");
        }

        if (room.Players.Count != 2)
        {
            throw new BusinessRuleException("Exactly two players are required for rematch.");
        }

        var hasCompletedMatch = room.Matches.Any(match =>
            match.Status == MatchStatus.Completed);

        if (!hasCompletedMatch)
        {
            throw new BusinessRuleException("There is no completed match to replay.");
        }

        var hasActiveMatch = room.Matches.Any(match =>
            match.Status == MatchStatus.Waiting ||
            match.Status == MatchStatus.Playing);

        if (hasActiveMatch)
        {
            throw new BusinessRuleException("An active match already exists in this room.");
        }

        return room;
    }

    private static RoomPlayer ValidateRematchRequester(
        Room room,
        string playerToken)
    {
        var requester = room.Players.FirstOrDefault(player =>
            player.PlayerToken == playerToken);

        if (requester is null)
        {
            throw new BusinessRuleException("Invalid player token.");
        }

        return requester;
    }

    private static RoomPlayer ValidateRematchResponder(
        Room room,
        string playerToken)
    {
        var responder = room.Players.FirstOrDefault(player =>
            player.PlayerToken == playerToken);

        if (responder is null)
        {
            throw new BusinessRuleException("Invalid player token.");
        }

        if (!room.RematchRequestedByPlayerId.HasValue ||
            !room.RematchRequestedAt.HasValue)
        {
            throw new BusinessRuleException("There is no pending rematch request.");
        }

        if (room.RematchRequestedByPlayerId == responder.Id)
        {
            throw new BusinessRuleException(
                "A player cannot respond to their own rematch request.");
        }

        var requesterStillInRoom = room.Players.Any(player =>
            player.Id == room.RematchRequestedByPlayerId.Value);

        if (!requesterStillInRoom)
        {
            throw new BusinessRuleException("The rematch requester is no longer in the room.");
        }

        return responder;
    }

    private static RoomResponse MapRoom(Room room)
    {
        return new RoomResponse
        {
            Id = room.Id,
            Code = room.Code,
            Status = room.Status,
            CreatedAt = room.CreatedAt,
            ClosedAt = room.ClosedAt,
            Players = room.Players
                .OrderByDescending(player => player.IsHost)
                .ThenBy(player => player.Nickname)
                .Select(player => new RoomPlayerResponse
                {
                    Id = player.Id,
                    Nickname = player.Nickname,
                    Score = player.Score,
                    IsReady = player.IsReady,
                    IsConnected = player.IsConnected,
                    IsHost = player.IsHost
                })
                .ToArray(),
            Matches = room.Matches
                .OrderByDescending(match => match.StartedAt ?? DateTime.MinValue)
                .Select(match => new MatchResponse
                {
                    Id = match.Id,
                    RoomId = match.RoomId,
                    Status = match.Status,
                    WinnerPlayerId = match.WinnerPlayerId,
                    StartedAt = match.StartedAt,
                    ExpiresAt = match.ExpiresAt,
                    CompletedAt = match.CompletedAt,
                    CompletionReason = match.CompletionReason
                })
                .ToArray()
        };
    }

    private async Task<RoomResponse> GetRoomForNotificationAsync(
        string code,
        CancellationToken cancellationToken)
    {
        var room = await dbContext.Rooms
            .AsNoTracking()
            .Include(room => room.Players)
            .Include(room => room.Matches)
            .FirstAsync(room => room.Code == code, cancellationToken);

        return MapRoom(room);
    }

    private async Task<GameMatch> CreatePlayingMatchAsync(
        Guid roomId,
        CancellationToken cancellationToken)
    {
        var targetWord = await wordProvider.GetRandomWordAsync(5, cancellationToken);
        var startedAt = DateTime.UtcNow;

        return new GameMatch
        {
            Id = Guid.NewGuid(),
            RoomId = roomId,
            TargetWord = targetWord,
            Status = MatchStatus.Playing,
            WinnerPlayerId = null,
            StartedAt = startedAt,
            ExpiresAt = startedAt.Add(GameRules.MatchDuration),
            CompletedAt = null
        };
    }

    private static MatchResponse MapMatch(GameMatch match)
    {
        return new MatchResponse
        {
            Id = match.Id,
            RoomId = match.RoomId,
            Status = match.Status,
            WinnerPlayerId = match.WinnerPlayerId,
            StartedAt = match.StartedAt,
            ExpiresAt = match.ExpiresAt,
            CompletedAt = match.CompletedAt,
            CompletionReason = match.CompletionReason
        };
    }

    private async Task<string> GenerateUniqueRoomCodeAsync(CancellationToken cancellationToken)
    {
        for (var attempt = 0; attempt < MaxRoomCodeGenerationAttempts; attempt++)
        {
            var code = GenerateRoomCode();
            var exists = await dbContext.Rooms
                .AnyAsync(room => room.Code == code, cancellationToken);

            if (!exists)
            {
                return code;
            }
        }

        throw new InvalidOperationException("A unique room code could not be generated after 10 attempts.");
    }

    private static string GenerateRoomCode()
    {
        return string.Create(RoomCodeLength, RoomCodeCharacters, static (code, characters) =>
        {
            for (var index = 0; index < code.Length; index++)
            {
                code[index] = characters[RandomNumberGenerator.GetInt32(characters.Length)];
            }
        }).ToUpperInvariant();
    }

    private static string GeneratePlayerToken()
    {
        return Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
    }
}
