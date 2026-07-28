using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using WordBattle.Application.Dtos.Requests;
using WordBattle.Application.Dtos.Responses;
using WordBattle.Application.Interfaces;
using WordBattle.Domain.Entities;
using WordBattle.Domain.Enums;

namespace WordBattle.Application.Services;

public sealed class RoomService(IGameDbContext dbContext) : IRoomService
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
        throw new NotImplementedException();
    }

    public Task<RoomResponse> GetAsync(
        string code,
        CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
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
