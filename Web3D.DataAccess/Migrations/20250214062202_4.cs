using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Web3D.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class _4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RevokedAt",
                table: "RefreshTokens");

            migrationBuilder.AddColumn<long>(
                name: "TestResultId1",
                table: "AnswerResults",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AnswerResults_TestResultId1",
                table: "AnswerResults",
                column: "TestResultId1");

            migrationBuilder.AddForeignKey(
                name: "FK_AnswerResults_TestResults_TestResultId1",
                table: "AnswerResults",
                column: "TestResultId1",
                principalTable: "TestResults",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AnswerResults_TestResults_TestResultId1",
                table: "AnswerResults");

            migrationBuilder.DropIndex(
                name: "IX_AnswerResults_TestResultId1",
                table: "AnswerResults");

            migrationBuilder.DropColumn(
                name: "TestResultId1",
                table: "AnswerResults");

            migrationBuilder.AddColumn<DateTime>(
                name: "RevokedAt",
                table: "RefreshTokens",
                type: "timestamp with time zone",
                nullable: true);
        }
    }
}
