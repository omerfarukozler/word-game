using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WordBattle.Domain.Entities;

namespace WordBattle.Infrastructure.Persistence.Configurations;

public sealed class GuessConfiguration : IEntityTypeConfiguration<Guess>
{
    public void Configure(EntityTypeBuilder<Guess> builder)
    {
        builder.ToTable("Guesses");

        builder.HasKey(guess => guess.Id);

        builder.Property(guess => guess.Word)
            .IsRequired()
            .HasMaxLength(16);

        builder.Property(guess => guess.AttemptNumber)
            .IsRequired();

        builder.Property(guess => guess.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        builder.HasOne<RoomPlayer>()
            .WithMany()
            .HasForeignKey(guess => guess.PlayerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
