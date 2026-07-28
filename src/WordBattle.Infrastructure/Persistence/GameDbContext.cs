using Microsoft.EntityFrameworkCore;
using WordBattle.Application.Interfaces;
using WordBattle.Domain.Entities;

namespace WordBattle.Infrastructure.Persistence;

public sealed class GameDbContext(DbContextOptions<GameDbContext> options)
    : DbContext(options), IGameDbContext
{
    public DbSet<Room> Rooms => Set<Room>();

    public DbSet<RoomPlayer> RoomPlayers => Set<RoomPlayer>();

    public DbSet<GameMatch> Matches => Set<GameMatch>();

    public DbSet<Guess> Guesses => Set<Guess>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(GameDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}
