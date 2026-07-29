using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WordBattle.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRoomRematchRequestFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "RematchRequestedAt",
                table: "Rooms",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RematchRequestedByPlayerId",
                table: "Rooms",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RematchRequestedAt",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "RematchRequestedByPlayerId",
                table: "Rooms");
        }
    }
}
