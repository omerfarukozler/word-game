using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WordBattle.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGameWords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GameWords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Text = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    Length = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CanBeTarget = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameWords", x => x.Id);
                    table.CheckConstraint("CK_GameWords_Length_Positive", "\"Length\" > 0");
                });

            migrationBuilder.CreateIndex(
                name: "IX_GameWords_Text",
                table: "GameWords",
                column: "Text",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GameWords");
        }
    }
}
