using Microsoft.EntityFrameworkCore;
using WordBattle.Domain.Entities;

namespace WordBattle.Application.Interfaces;

public interface IGameDbContext
{
    DbSet<Room> Rooms { get; }

    DbSet<RoomPlayer> RoomPlayers { get; }

    DbSet<GameMatch> Matches { get; }

    DbSet<Guess> Guesses { get; }

    DbSet<GameWord> GameWords { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
