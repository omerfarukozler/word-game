using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WordBattle.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGameWordImportMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Frequency",
                table: "GameWords",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FrequencyRank",
                table: "GameWords",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Source",
                table: "GameWords",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Frequency",
                table: "GameWords");

            migrationBuilder.DropColumn(
                name: "FrequencyRank",
                table: "GameWords");

            migrationBuilder.DropColumn(
                name: "Source",
                table: "GameWords");
        }
    }
}
