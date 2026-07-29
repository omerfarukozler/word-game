using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WordBattle.Domain.Entities;

namespace WordBattle.Infrastructure.Persistence.Configurations;

public sealed class GameWordConfiguration : IEntityTypeConfiguration<GameWord>
{
    public void Configure(EntityTypeBuilder<GameWord> builder)
    {
        builder.ToTable("GameWords", table =>
        {
            table.HasCheckConstraint(
                "CK_GameWords_Length_Positive",
                "\"Length\" > 0");
        });

        builder.HasKey(gameWord => gameWord.Id);

        builder.Property(gameWord => gameWord.Text)
            .HasMaxLength(16)
            .IsRequired();

        builder.Property(gameWord => gameWord.Length)
            .IsRequired();

        builder.Property(gameWord => gameWord.IsActive)
            .IsRequired();

        builder.Property(gameWord => gameWord.CanBeTarget)
            .IsRequired();

        builder.Property(gameWord => gameWord.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        builder.HasIndex(gameWord => gameWord.Text)
            .IsUnique();

        builder.HasData(GameWordSeedData.GetWords());
    }
}
