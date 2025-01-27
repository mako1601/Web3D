using Microsoft.EntityFrameworkCore;

using Web3D.Domain.Models;

namespace Web3D.DataAccess.Contexts;

public class Web3DDbContext(DbContextOptions<Web3DDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Test> Tests { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<AnswerOption> AnswerOptions { get; set; }
    public DbSet<Article> Articles { get; set; }
    public DbSet<TestResult> TestResults { get; set; }
    public DbSet<AnswerResult> AnswerResults { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>()
            .HasKey(x => x.Id);
        modelBuilder.Entity<User>()
            .Property(x => x.Login)
            .HasMaxLength(64)
            .IsRequired();
        modelBuilder.Entity<User>()
            .HasIndex(x => x.Login)
            .IsUnique();
        modelBuilder.Entity<User>()
            .Property(x => x.LastName)
            .HasMaxLength(64)
            .IsRequired();
        modelBuilder.Entity<User>()
            .Property(x => x.FirstName)
            .HasMaxLength(64)
            .IsRequired();
        modelBuilder.Entity<User>()
            .Property(x => x.MiddleName)
            .HasMaxLength(64);
        modelBuilder.Entity<User>()
            .Property(x => x.Role)
            .HasConversion<string>();
        modelBuilder.Entity<User>()
            .HasMany(x => x.Tests)
            .WithOne()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<User>()
            .HasMany(x => x.Articles)
            .WithOne()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Test
        modelBuilder.Entity<Test>()
            .HasKey(x => x.Id);
        modelBuilder.Entity<Test>()
            .Property(x => x.Title)
            .HasMaxLength(128)
            .IsRequired();
        modelBuilder.Entity<Test>()
            .HasIndex(x => x.Title);
        modelBuilder.Entity<Test>()
            .Property(x => x.Description)
            .HasMaxLength(512);
        modelBuilder.Entity<Test>()
            .Property(x => x.CreatedAt)
            .HasDefaultValueSql("NOW()");
        modelBuilder.Entity<Test>()
            .HasMany(x => x.Questions)
            .WithOne()
            .HasForeignKey(x => x.TestId)
            .OnDelete(DeleteBehavior.Cascade);

        // Question
        modelBuilder.Entity<Question>()
            .HasKey(x => x.Id);
        modelBuilder.Entity<Question>()
            .Property(x => x.Text)
            .HasMaxLength(256)
            .IsRequired();
        modelBuilder.Entity<Question>()
            .HasMany(x => x.AnswerOptions)
            .WithOne()
            .HasForeignKey(x => x.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        // AnswerOption
        modelBuilder.Entity<AnswerOption>()
            .HasKey(x => x.Id);
        modelBuilder.Entity<AnswerOption>()
            .Property(x => x.Text)
            .HasMaxLength(256)
            .IsRequired();
        modelBuilder.Entity<AnswerOption>()
            .Property(x => x.IsCorrect)
            .HasDefaultValue(false);

        // Article
        modelBuilder.Entity<Article>()
            .HasKey(x => x.Id);
        modelBuilder.Entity<Article>()
            .Property(x => x.Title)
            .HasMaxLength(128)
            .IsRequired();
        modelBuilder.Entity<Article>()
            .Property(x => x.Description)
            .HasMaxLength(512);

        // TestResult
        modelBuilder.Entity<TestResult>()
            .HasKey(x => x.Id);
        modelBuilder.Entity<TestResult>()
            .HasIndex(x => new { x.UserId, x.TestId, x.Attempt })
            .IsUnique();
        modelBuilder.Entity<TestResult>()
            .Property(x => x.StartedAt)
            .HasDefaultValueSql("NOW()");
        modelBuilder.Entity<TestResult>()
            .HasMany(x => x.AnswerResults)
            .WithOne()
            .HasForeignKey(x => x.TestResultId)
            .OnDelete(DeleteBehavior.Cascade);

        // AnswerResult
        modelBuilder.Entity<AnswerResult>()
            .HasKey(x => x.Id);
        modelBuilder.Entity<AnswerResult>()
            .Property(x => x.IsCorrect)
            .HasDefaultValue(false);
        modelBuilder.Entity<AnswerResult>()
            .HasIndex(x => x.TestResultId);
        modelBuilder.Entity<AnswerResult>()
            .HasIndex(x => x.QuestionId);
        modelBuilder.Entity<AnswerResult>()
            .HasIndex(x => x.AnswerOptionId);
    }
}
