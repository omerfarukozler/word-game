using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WordBattle.Domain.Entities;

namespace WordBattle.Infrastructure.Persistence.Configurations;

public sealed class RoomConfiguration : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> builder)
    {
        builder.ToTable("Rooms");

        builder.HasKey(room => room.Id);

        builder.Property(room => room.Code)
            .IsRequired()
            .HasMaxLength(12);

        builder.Property(room => room.Status)
            .IsRequired()
            .HasColumnType("integer");

        builder.Property(room => room.CreatedAt)
            .IsRequired()
            .HasColumnType("timestamp with time zone");

        builder.Property(room => room.ClosedAt)
            .HasColumnType("timestamp with time zone");

        builder.HasMany(room => room.Players)
            .WithOne(player => player.Room)
            .HasForeignKey(player => player.RoomId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(room => room.Matches)
            .WithOne(match => match.Room)
            .HasForeignKey(match => match.RoomId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(room => room.Code)
            .IsUnique();

        builder.HasIndex(room => room.CreatedAt);
    }
}
