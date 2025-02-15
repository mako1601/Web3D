using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Web3D.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class _5 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
    }
}
