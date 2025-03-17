using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Web3D.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class _9 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Content",
                table: "Articles",
                newName: "ContentUrl");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Articles",
                type: "character varying(250)",
                maxLength: 250,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(250)",
                oldMaxLength: 250);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ContentUrl",
                table: "Articles",
                newName: "Content");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Articles",
                type: "character varying(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(250)",
                oldMaxLength: 250,
                oldNullable: true);
        }
    }
}
