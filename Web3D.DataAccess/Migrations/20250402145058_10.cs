using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Web3D.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class _10 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AnswerResults_AnswerOptionId",
                table: "AnswerResults");

            migrationBuilder.DropColumn(
                name: "AnswerOptionId",
                table: "AnswerResults");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "AnswerOptionId",
                table: "AnswerResults",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AnswerResults_AnswerOptionId",
                table: "AnswerResults",
                column: "AnswerOptionId");
        }
    }
}
