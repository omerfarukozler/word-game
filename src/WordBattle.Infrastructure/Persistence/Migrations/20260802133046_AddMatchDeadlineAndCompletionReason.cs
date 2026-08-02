using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WordBattle.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMatchDeadlineAndCompletionReason : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CompletionReason",
                table: "GameMatches",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiresAt",
                table: "GameMatches",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletionReason",
                table: "GameMatches");

            migrationBuilder.DropColumn(
                name: "ExpiresAt",
                table: "GameMatches");
        }
    }
}
