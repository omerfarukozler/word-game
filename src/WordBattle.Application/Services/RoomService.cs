using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WordBattle.Application.Dtos.Requests;
using WordBattle.Application.Dtos.Responses;
using WordBattle.Application.Exceptions;
using WordBattle.Application.Interfaces;
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

        var hasActiveMatch = room.Matches.Any(match =>
            match.Status == MatchStatus.Waiting ||
            match.Status == MatchStatus.Playing);

        if (hasActiveMatch)
        {
            throw new BusinessRuleException("An active match already exists in this room.");
        }

        var targetWord = await wordProvider.GetRandomWordAsync(5, cancellationToken);
        var startedAt = DateTime.UtcNow;
        var match = new GameMatch
        {
            Id = Guid.NewGuid(),
            RoomId = room.Id,
            TargetWord = targetWord,
            Status = MatchStatus.Playing,
            WinnerPlayerId = null,
            StartedAt = startedAt,
            CompletedAt = null
        };

        dbContext.Matches.Add(match);
        room.Status = RoomStatus.Playing;

        await dbContext.SaveChangesAsync(cancellationToken);

        var response = new MatchResponse
        {
            Id = match.Id,
            RoomId = match.RoomId,
            Status = match.Status,
            WinnerPlayerId = match.WinnerPlayerId,
            StartedAt = match.StartedAt,
            CompletedAt = match.CompletedAt
        };

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

    public Task<MatchResponse> RematchAsync(
        string code,
        CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
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
                    CompletedAt = match.CompletedAt
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
