using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WordBattle.Domain.Entities;

namespace WordBattle.Infrastructure.Persistence.Configurations;

public sealed class GameMatchConfiguration : IEntityTypeConfiguration<GameMatch>
{
    public void Configure(EntityTypeBuilder<GameMatch> builder)
    {
        builder.ToTable("GameMatches");

        builder.HasKey(match => match.Id);

        builder.Property(match => match.TargetWord)
            .IsRequired()
            .HasMaxLength(16);

        builder.Property(match => match.Status)
            .IsRequired()
            .HasColumnType("integer");

        builder.Property(match => match.StartedAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(match => match.ExpiresAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(match => match.CompletedAt)
            .HasColumnType("timestamp with time zone");

        builder.Property(match => match.CompletionReason)
            .HasColumnType("integer");

        builder.HasMany(match => match.Guesses)
            .WithOne(guess => guess.Match)
            .HasForeignKey(guess => guess.MatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<RoomPlayer>()
            .WithMany()
            .HasForeignKey(match => match.WinnerPlayerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
