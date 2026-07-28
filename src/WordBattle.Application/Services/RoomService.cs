using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using WordBattle.Application.Dtos.Requests;
using WordBattle.Application.Dtos.Responses;
using WordBattle.Application.Exceptions;
using WordBattle.Application.Interfaces;
using WordBattle.Domain.Entities;
using WordBattle.Domain.Enums;

namespace WordBattle.Application.Services;

public sealed class RoomService(IGameDbContext dbContext, IGameNotifier gameNotifier) : IRoomService
{
    private const string RoomCodeCharacters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private const int RoomCodeLength = 6;
    private const int MaxRoomCodeGenerationAttempts = 10;

    public Task<CreateRoomResponse> CreateAsync(
        CreateRoomRequest request,
        CancellationToken cancellationToken = default)
    {
        return CreateRoomAsync(request, cancellationToken);
    }

    public Task<JoinRoomResponse> JoinAsync(
        string code,
        JoinRoomRequest request,
        CancellationToken cancellationToken = default)
    {
        return JoinRoomAsync(code, request, cancellationToken);
    }

    public Task<RoomResponse> GetAsync(
        string code,
        CancellationToken cancellationToken = default)
    {
        return GetRoomAsync(code, cancellationToken);
    }

    public Task<MatchResponse> StartAsync(
        string code,
        CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<MatchResponse> RematchAsync(
        string code,
        CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    private async Task<CreateRoomResponse> CreateRoomAsync(
        CreateRoomRequest request,
        CancellationToken cancellationToken)
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

    private async Task<JoinRoomResponse> JoinRoomAsync(
        string code,
        JoinRoomRequest request,
        CancellationToken cancellationToken)
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

        if (room.Players.Count == 2)
        {
            room.Status = RoomStatus.Ready;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        var roomUpdated = await GetRoomForNotificationAsync(room.Code, cancellationToken);
        await gameNotifier.RoomUpdatedAsync(room.Code, roomUpdated, cancellationToken);

        return new JoinRoomResponse
        {
            RoomId = room.Id,
            Code = room.Code,
            PlayerId = newPlayer.Id,
            PlayerToken = newPlayer.PlayerToken
        };
    }

    private async Task<RoomResponse> GetRoomAsync(
        string code,
        CancellationToken cancellationToken)
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
