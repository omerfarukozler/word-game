using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace WordBattle.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialGameWords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "GameWords",
                columns: new[] { "Id", "CanBeTarget", "CreatedAt", "IsActive", "Length", "Text" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000001"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "AKŞAM" },
                    { new Guid("00000000-0000-0000-0000-000000000002"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "ARMUT" },
                    { new Guid("00000000-0000-0000-0000-000000000003"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "BAHAR" },
                    { new Guid("00000000-0000-0000-0000-000000000004"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "BALIK" },
                    { new Guid("00000000-0000-0000-0000-000000000005"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "BAVUL" },
                    { new Guid("00000000-0000-0000-0000-000000000006"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "BEBEK" },
                    { new Guid("00000000-0000-0000-0000-000000000007"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "BİBER" },
                    { new Guid("00000000-0000-0000-0000-000000000008"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "BİLEK" },
                    { new Guid("00000000-0000-0000-0000-000000000009"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "BULUT" },
                    { new Guid("00000000-0000-0000-0000-000000000010"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "CEVİZ" },
                    { new Guid("00000000-0000-0000-0000-000000000011"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "ÇİÇEK" },
                    { new Guid("00000000-0000-0000-0000-000000000012"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "ÇORAP" },
                    { new Guid("00000000-0000-0000-0000-000000000013"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "DAMAR" },
                    { new Guid("00000000-0000-0000-0000-000000000014"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "DEMİR" },
                    { new Guid("00000000-0000-0000-0000-000000000015"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "DENİZ" },
                    { new Guid("00000000-0000-0000-0000-000000000016"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "DÜĞÜN" },
                    { new Guid("00000000-0000-0000-0000-000000000017"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "EKMEK" },
                    { new Guid("00000000-0000-0000-0000-000000000018"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "ELMAS" },
                    { new Guid("00000000-0000-0000-0000-000000000019"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "FIRIN" },
                    { new Guid("00000000-0000-0000-0000-000000000020"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "GÖLET" },
                    { new Guid("00000000-0000-0000-0000-000000000021"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "GÜNEŞ" },
                    { new Guid("00000000-0000-0000-0000-000000000022"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "HAMUR" },
                    { new Guid("00000000-0000-0000-0000-000000000023"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "HAVUÇ" },
                    { new Guid("00000000-0000-0000-0000-000000000024"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "İNCİR" },
                    { new Guid("00000000-0000-0000-0000-000000000025"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "KALEM" },
                    { new Guid("00000000-0000-0000-0000-000000000026"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "KANAT" },
                    { new Guid("00000000-0000-0000-0000-000000000027"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "KAPAK" },
                    { new Guid("00000000-0000-0000-0000-000000000028"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "KAVUN" },
                    { new Guid("00000000-0000-0000-0000-000000000029"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "KEMER" },
                    { new Guid("00000000-0000-0000-0000-000000000030"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "KİRAZ" },
                    { new Guid("00000000-0000-0000-0000-000000000031"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "KİTAP" },
                    { new Guid("00000000-0000-0000-0000-000000000032"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "KÖPRÜ" },
                    { new Guid("00000000-0000-0000-0000-000000000033"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "KUMRU" },
                    { new Guid("00000000-0000-0000-0000-000000000034"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "KUTUP" },
                    { new Guid("00000000-0000-0000-0000-000000000035"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "KUYRU" },
                    { new Guid("00000000-0000-0000-0000-000000000036"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "MASAL" },
                    { new Guid("00000000-0000-0000-0000-000000000037"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "MEYVE" },
                    { new Guid("00000000-0000-0000-0000-000000000038"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "ORMAN" },
                    { new Guid("00000000-0000-0000-0000-000000000039"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "OYNAK" },
                    { new Guid("00000000-0000-0000-0000-000000000040"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "PAZAR" },
                    { new Guid("00000000-0000-0000-0000-000000000041"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "SABAH" },
                    { new Guid("00000000-0000-0000-0000-000000000042"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "SAHİL" },
                    { new Guid("00000000-0000-0000-0000-000000000043"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "SEPET" },
                    { new Guid("00000000-0000-0000-0000-000000000044"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "ŞEHİR" },
                    { new Guid("00000000-0000-0000-0000-000000000045"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "TABAK" },
                    { new Guid("00000000-0000-0000-0000-000000000046"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "TAVUK" },
                    { new Guid("00000000-0000-0000-0000-000000000047"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "TOPUZ" },
                    { new Guid("00000000-0000-0000-0000-000000000048"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "YAPIT" },
                    { new Guid("00000000-0000-0000-0000-000000000049"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "YILAN" },
                    { new Guid("00000000-0000-0000-0000-000000000050"), true, new DateTime(2026, 7, 29, 0, 0, 0, 0, DateTimeKind.Utc), true, 5, "YOLCU" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000005"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000006"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000007"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000008"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000009"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000010"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000011"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000012"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000013"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000014"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000015"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000016"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000017"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000018"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000019"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000020"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000021"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000022"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000023"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000024"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000025"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000026"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000027"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000028"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000029"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000030"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000031"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000032"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000033"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000034"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000035"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000036"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000037"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000038"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000039"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000040"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000041"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000042"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000043"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000044"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000045"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000046"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000047"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000048"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000049"));

            migrationBuilder.DeleteData(
                table: "GameWords",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000050"));
        }
    }
}
