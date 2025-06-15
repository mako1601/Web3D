using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Web3D.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class _1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "RelatedArticleId",
                table: "Tests",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "RelatedTestId",
                table: "Articles",
                type: "bigint",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RelatedArticleId",
                table: "Tests");

            migrationBuilder.DropColumn(
                name: "RelatedTestId",
                table: "Articles");
        }
    }
}
