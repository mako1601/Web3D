using CloudinaryDotNet.Actions;
using Moq;
using Newtonsoft.Json;
using System.Text.Json;
using Web3D.BusinessLogic.Abstractions;
using Web3D.BusinessLogic.Services;
using Web3D.DataAccess.Abstractions;
using Web3D.Domain.Exceptions;
using Web3D.Domain.Filters;
using Web3D.Domain.Models;
using Web3D.Domain.Models.Dto;
using Xunit;

namespace Web3D.Test.Services;

public class TestServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<ITestRepository> _testRepositoryMock;
    private readonly Mock<ITestResultRepository> _testResultRepositoryMock;
    private readonly Mock<ICloudinaryService> _cloudinaryServiceMock;
    private readonly TestService _testService;

    public TestServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _testRepositoryMock = new Mock<ITestRepository>();
        _testResultRepositoryMock = new Mock<ITestResultRepository>();
        _cloudinaryServiceMock = new Mock<ICloudinaryService>();
        _testService = new TestService(
            _userRepositoryMock.Object,
            _testRepositoryMock.Object,
            _testResultRepositoryMock.Object,
            _cloudinaryServiceMock.Object);
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateTest()
    {
        // Arrange
        long userId = 1;
        string title = "Test Title";
        string description = "Test Description";
        var questions = new List<Question>();
        long relatedArticleId = 1;
        var cancellationToken = CancellationToken.None;

        Domain.Models.Test createdTest = null;
        _testRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<Domain.Models.Test>(), cancellationToken))
            .Callback<Domain.Models.Test, CancellationToken>((test, _) => createdTest = test)
            .Returns(Task.CompletedTask);

        // Act
        await _testService.CreateAsync(userId, title, description, questions, relatedArticleId, cancellationToken);

        // Assert
        _testRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<Domain.Models.Test>(), cancellationToken), Times.Once);
        Assert.NotNull(createdTest);
        Assert.Equal(userId, createdTest.UserId);
        Assert.Equal(title, createdTest.Title);
        Assert.Equal(description, createdTest.Description);
        Assert.Equal(questions, createdTest.Questions);
        Assert.True(createdTest.CreatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnTest_WhenExists()
    {
        // Arrange
        long testId = 1;
        var expectedTest = new Domain.Models.Test { Id = testId };
        var cancellationToken = CancellationToken.None;

        _testRepositoryMock.Setup(x => x.GetByIdAsync(testId, cancellationToken))
            .ReturnsAsync(expectedTest);

        // Act
        var result = await _testService.GetByIdAsync(testId, cancellationToken);

        // Assert
        Assert.Equal(expectedTest, result);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldThrowTestNotFoundException_WhenNotExists()
    {
        // Arrange
        long testId = 1;
        var cancellationToken = CancellationToken.None;

        _testRepositoryMock.Setup(x => x.GetByIdAsync(testId, cancellationToken))
            .ReturnsAsync((Domain.Models.Test)null);

        // Act & Assert
        await Assert.ThrowsAsync<TestNotFoundException>(
            () => _testService.GetByIdAsync(testId, cancellationToken));
    }

    [Fact]
    public async Task GetForPassingByIdAsync_ShouldReturnTestWithModifiedQuestions()
    {
        // Arrange
        long testId = 1;
        var cancellationToken = CancellationToken.None;

        var test = new Domain.Models.Test
        {
            Id = testId,
            Questions = new List<Question>
            {
                new Question
                {
                    Id = 1,
                    Type = QuestionType.SingleChoice,
                    TaskJson = "{\"options\":[\"Option1\",\"Option2\"],\"answer\":[true,false]}"
                },
                new Question
                {
                    Id = 2,
                    Type = QuestionType.Matching,
                    TaskJson = "{\"answer\":[[\"Left1\",\"Right1\"],[\"Left2\",\"Right2\"]]}"
                },
                new Question
                {
                    Id = 3,
                    Type = QuestionType.FillInTheBlank,
                    TaskJson = "{\"answer\":\"Correct Answer\"}"
                }
            }
        };

        _testRepositoryMock.Setup(x => x.GetByIdAsync(testId, cancellationToken))
            .ReturnsAsync(test);

        // Act
        var result = await _testService.GetForPassingByIdAsync(testId, cancellationToken);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.Questions.Count);

        // Check SingleChoice question
        var singleChoiceQuestion = result.Questions.First(q => q.Type == QuestionType.SingleChoice);
        var singleChoiceJson = JsonDocument.Parse(singleChoiceQuestion.TaskJson);
        Assert.True(singleChoiceJson.RootElement.GetProperty("options").GetArrayLength() > 0);
        Assert.True(singleChoiceJson.RootElement.GetProperty("answer").EnumerateArray().All(x => x.GetBoolean() == false));

        // Check Matching question
        var matchingQuestion = result.Questions.First(q => q.Type == QuestionType.Matching);
        var matchingJson = JsonDocument.Parse(matchingQuestion.TaskJson);
        Assert.Equal(2, matchingJson.RootElement.GetProperty("answer").GetArrayLength());

        // Check FillInTheBlank question
        var fillQuestion = result.Questions.First(q => q.Type == QuestionType.FillInTheBlank);
        var fillJson = JsonDocument.Parse(fillQuestion.TaskJson);
        Assert.Equal("", fillJson.RootElement.GetProperty("answer").GetString());
    }

    [Fact]
    public async Task GetForPassingByIdAsync_ShouldThrowException_WhenJsonInvalid()
    {
        // Arrange
        long testId = 1;
        var cancellationToken = CancellationToken.None;

        var test = new Domain.Models.Test
        {
            Id = testId,
            Questions = new List<Question>
            {
                new Question
                {
                    Id = 1,
                    Type = QuestionType.SingleChoice,
                    TaskJson = "invalid json"
                }
            }
        };

        _testRepositoryMock.Setup(x => x.GetByIdAsync(testId, cancellationToken))
            .ReturnsAsync(test);

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(
            () => _testService.GetForPassingByIdAsync(testId, cancellationToken));
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnPageResult()
    {
        // Arrange
        var filter = new Filter();
        var sortParams = new SortParams();
        var pageParams = new PageParams();
        var expectedResult = new PageResult<Domain.Models.Test>([new Domain.Models.Test()], 1);
        var cancellationToken = CancellationToken.None;

        _testRepositoryMock.Setup(x => x.GetAllAsync(filter, sortParams, pageParams, cancellationToken))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _testService.GetAllAsync(filter, sortParams, pageParams, cancellationToken);

        // Assert
        Assert.Equal(expectedResult, result);
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateTest_WhenExists()
    {
        // Arrange
        long testId = 1;
        string newTitle = "New Title";
        string newDescription = "New Description";
        var newQuestions = new List<Question>();
        long relatedArticleId = 1;
        var cancellationToken = CancellationToken.None;

        var existingTest = new Domain.Models.Test { Id = testId };
        _testRepositoryMock.Setup(x => x.GetByIdAsync(testId, cancellationToken))
            .ReturnsAsync(existingTest);

        _testRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<Domain.Models.Test>(), cancellationToken))
            .Returns(Task.CompletedTask);

        // Act
        await _testService.UpdateAsync(testId, newTitle, newDescription, newQuestions, relatedArticleId, cancellationToken);

        // Assert
        _testRepositoryMock.Verify(x => x.GetByIdAsync(testId, cancellationToken), Times.Once);
        _testRepositoryMock.Verify(x => x.UpdateAsync(existingTest, cancellationToken), Times.Once);
        Assert.Equal(newTitle, existingTest.Title);
        Assert.Equal(newDescription, existingTest.Description);
        Assert.Equal(newQuestions, existingTest.Questions);
        Assert.True(existingTest.UpdatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrowTestNotFoundException_WhenNotExists()
    {
        // Arrange
        long testId = 1;
        var cancellationToken = CancellationToken.None;

        _testRepositoryMock.Setup(x => x.GetByIdAsync(testId, cancellationToken))
            .ReturnsAsync((Domain.Models.Test)null);

        // Act & Assert
        await Assert.ThrowsAsync<TestNotFoundException>(
            () => _testService.UpdateAsync(testId, "title", "desc", new List<Question>(), 1, cancellationToken));
    }

    [Fact]
    public async Task DeleteAsync_ShouldDeleteTestAndImages_WhenExists()
    {
        // Arrange
        long testId = 1;
        var imageUrl = "https://res.cloudinary.com/test/image/upload/test.jpg";
        var cancellationToken = CancellationToken.None;

        var existingTest = new Domain.Models.Test
        {
            Id = testId,
            Questions = new List<Question>
            {
                new Question { ImageUrl = imageUrl },
                new Question { ImageUrl = null }
            }
        };

        _testRepositoryMock.Setup(x => x.GetByIdAsync(testId, cancellationToken))
            .ReturnsAsync(existingTest);

        _testRepositoryMock.Setup(x => x.DeleteAsync(existingTest, cancellationToken))
            .Returns(Task.CompletedTask);

        _cloudinaryServiceMock.Setup(x => x.DestroyAsync(It.IsAny<DeletionParams>()))
            .ReturnsAsync(new DeletionResult { Result = "ok" });

        // Act
        await _testService.DeleteAsync(testId, cancellationToken);

        // Assert
        _testRepositoryMock.Verify(x => x.GetByIdAsync(testId, cancellationToken), Times.Once);
        _testRepositoryMock.Verify(x => x.DeleteAsync(existingTest, cancellationToken), Times.Once);
        _cloudinaryServiceMock.Verify(x => x.DestroyAsync(It.Is<DeletionParams>(p =>
            p.PublicId == "test" && p.ResourceType == ResourceType.Image)), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ShouldThrowTestNotFoundException_WhenNotExists()
    {
        // Arrange
        long testId = 1;
        var cancellationToken = CancellationToken.None;

        _testRepositoryMock.Setup(x => x.GetByIdAsync(testId, cancellationToken))
            .ReturnsAsync((Domain.Models.Test)null);

        // Act & Assert
        await Assert.ThrowsAsync<TestNotFoundException>(
            () => _testService.DeleteAsync(testId, cancellationToken));
    }

    [Fact]
    public async Task StartTestAsync_ShouldCreateTestResult()
    {
        // Arrange
        long testId = 1;
        long userId = 1;
        int attempt = 0;
        var cancellationToken = CancellationToken.None;

        _testRepositoryMock.Setup(x => x.GetByIdAsync(testId, cancellationToken))
            .ReturnsAsync(new Domain.Models.Test());

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, cancellationToken))
            .ReturnsAsync(new User());

        _testResultRepositoryMock.Setup(x => x.GetAttemptAsync(testId, userId, cancellationToken))
            .ReturnsAsync(attempt);

        TestResult createdTestResult = null;
        _testResultRepositoryMock.Setup(x => x.StartTestAsync(It.IsAny<TestResult>(), cancellationToken))
            .Callback<TestResult, CancellationToken>((tr, _) => createdTestResult = tr)
            .ReturnsAsync(1L);

        // Act
        var result = await _testService.StartTestAsync(testId, userId, cancellationToken);

        // Assert
        Assert.Equal(1L, result);
        Assert.NotNull(createdTestResult);
        Assert.Equal(testId, createdTestResult.TestId);
        Assert.Equal(userId, createdTestResult.UserId);
        Assert.Equal(attempt, createdTestResult.Attempt);
        Assert.True(createdTestResult.StartedAt <= DateTime.UtcNow);
    }

    [Fact]
    public async Task StartTestAsync_ShouldThrowTestNotFoundException_WhenTestNotExists()
    {
        // Arrange
        long testId = 1;
        long userId = 1;
        var cancellationToken = CancellationToken.None;

        _testRepositoryMock.Setup(x => x.GetByIdAsync(testId, cancellationToken))
            .ReturnsAsync((Domain.Models.Test)null);

        // Act & Assert
        await Assert.ThrowsAsync<TestNotFoundException>(
            () => _testService.StartTestAsync(testId, userId, cancellationToken));
    }

    [Fact]
    public async Task StartTestAsync_ShouldThrowUserNotFoundException_WhenUserNotExists()
    {
        // Arrange
        long testId = 1;
        long userId = 1;
        var cancellationToken = CancellationToken.None;

        _testRepositoryMock.Setup(x => x.GetByIdAsync(testId, cancellationToken))
            .ReturnsAsync(new Domain.Models.Test());

        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId, cancellationToken))
            .ReturnsAsync((User)null);

        // Act & Assert
        await Assert.ThrowsAsync<UserNotFoundException>(
            () => _testService.StartTestAsync(testId, userId, cancellationToken));
    }

    [Fact]
    public async Task FinishTestAsync_ShouldCalculateScoreAndSaveResults()
    {
        // Arrange
        long testResultId = 1;
        var cancellationToken = CancellationToken.None;

        var testResult = new TestResult
        {
            Id = testResultId,
            TestId = 1,
            StartedAt = DateTime.UtcNow.AddMinutes(-10)
        };

        var test = new Domain.Models.Test
        {
            Id = 1,
            Questions = new List<Question>
            {
                new Question
                {
                    Id = 1,
                    Type = QuestionType.SingleChoice,
                    TaskJson = "{\"answer\":true}"
                },
                new Question
                {
                    Id = 2,
                    Type = QuestionType.FillInTheBlank,
                    TaskJson = "{\"answer\":\"correct\"}"
                }
            }
        };

        var answerResults = new List<AnswerResultDto>
        {
            new AnswerResultDto
            {
                QuestionId = 1,
                UserAnswerJson = "{\"answer\":true}"
            },
            new AnswerResultDto
            {
                QuestionId = 2,
                UserAnswerJson = "{\"answer\":\"wrong\"}"
            }
        };

        _testResultRepositoryMock.Setup(x => x.GetTestResultByIdAsync(testResultId, cancellationToken))
            .ReturnsAsync(testResult);

        _testRepositoryMock.Setup(x => x.GetByIdAsync(testResult.TestId, cancellationToken))
            .ReturnsAsync(test);

        _testResultRepositoryMock.Setup(x => x.UpdateAsync(testResult, cancellationToken))
            .Returns(Task.CompletedTask);

        // Act
        await _testService.FinishTestAsync(testResultId, answerResults, cancellationToken);

        // Assert
        Assert.True(testResult.EndedAt <= DateTime.UtcNow);
        Assert.Equal(50, testResult.Score);
        Assert.NotNull(testResult.AnswersJson);

        var answers = JsonConvert.DeserializeObject<List<dynamic>>(testResult.AnswersJson);
        Assert.Equal(2, answers.Count);
        Assert.True((bool)answers[0].isCorrect);
        Assert.False((bool)answers[1].isCorrect);
    }

    [Fact]
    public async Task FinishTestAsync_ShouldThrowException_WhenTestResultNotFound()
    {
        // Arrange
        long testResultId = 1;
        var cancellationToken = CancellationToken.None;

        _testResultRepositoryMock.Setup(x => x.GetTestResultByIdAsync(testResultId, cancellationToken))
            .ReturnsAsync((TestResult)null);

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(
            () => _testService.FinishTestAsync(testResultId, new List<AnswerResultDto>(), cancellationToken));
    }

    [Fact]
    public async Task FinishTestAsync_ShouldThrowTestNotFoundException_WhenTestNotFound()
    {
        // Arrange
        long testResultId = 1;
        var cancellationToken = CancellationToken.None;

        var testResult = new TestResult { TestId = 1 };
        _testResultRepositoryMock.Setup(x => x.GetTestResultByIdAsync(testResultId, cancellationToken))
            .ReturnsAsync(testResult);

        _testRepositoryMock.Setup(x => x.GetByIdAsync(testResult.TestId, cancellationToken))
            .ReturnsAsync((Web3D.Domain.Models.Test)null);

        // Act & Assert
        await Assert.ThrowsAsync<TestNotFoundException>(
            () => _testService.FinishTestAsync(testResultId, new List<AnswerResultDto>(), cancellationToken));
    }

    [Fact]
    public async Task GetTestResultByIdAsync_ShouldReturnTestResult_WhenExists()
    {
        // Arrange
        long testResultId = 1;
        var expectedTestResult = new TestResult { Id = testResultId };
        var cancellationToken = CancellationToken.None;

        _testResultRepositoryMock.Setup(x => x.GetTestResultByIdAsync(testResultId, cancellationToken))
            .ReturnsAsync(expectedTestResult);

        // Act
        var result = await _testService.GetTestResultByIdAsync(testResultId, cancellationToken);

        // Assert
        Assert.Equal(expectedTestResult, result);
    }

    [Fact]
    public async Task GetTestResultByIdAsync_ShouldThrowException_WhenNotExists()
    {
        // Arrange
        long testResultId = 1;
        var cancellationToken = CancellationToken.None;

        _testResultRepositoryMock.Setup(x => x.GetTestResultByIdAsync(testResultId, cancellationToken))
            .ReturnsAsync((TestResult)null);

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(
            () => _testService.GetTestResultByIdAsync(testResultId, cancellationToken));
    }

    [Fact]
    public async Task GetAllTestResultsAsync_ShouldReturnPageResult()
    {
        // Arrange
        var filter = new Filter();
        var sortParams = new SortParams();
        var pageParams = new PageParams();
        var expectedResult = new PageResult<TestResult>([new TestResult()], 1);
        var cancellationToken = CancellationToken.None;

        _testResultRepositoryMock.Setup(x => x.GetAllAsync(filter, sortParams, pageParams, cancellationToken))
            .ReturnsAsync(expectedResult);

        // Act
        var result = await _testService.GetAllTestResultsAsync(filter, sortParams, pageParams, cancellationToken);

        // Assert
        Assert.Equal(expectedResult, result);
    }

    [Fact]
    public async Task DeleteImagesAsync_ShouldDeleteAllImages()
    {
        // Arrange
        var imageUrls = new List<string>
        {
            "https://res.cloudinary.com/test/image/upload/img1.jpg",
            "https://res.cloudinary.com/test/image/upload/img2.jpg"
        };

        _cloudinaryServiceMock.Setup(x => x.DestroyAsync(It.IsAny<DeletionParams>()))
            .ReturnsAsync(new DeletionResult { Result = "ok" });

        // Act
        await _testService.InvokeDeleteImagesAsync(imageUrls);

        // Assert
        _cloudinaryServiceMock.Verify(x => x.DestroyAsync(It.Is<DeletionParams>(p =>
            p.PublicId == "img1" && p.ResourceType == ResourceType.Image)), Times.Once);
        _cloudinaryServiceMock.Verify(x => x.DestroyAsync(It.Is<DeletionParams>(p =>
            p.PublicId == "img2" && p.ResourceType == ResourceType.Image)), Times.Once);
    }

    [Fact]
    public async Task DeleteImagesAsync_ShouldThrowException_WhenDeletionFails()
    {
        // Arrange
        var imageUrls = new List<string>
        {
            "https://res.cloudinary.com/test/image/upload/img1.jpg"
        };

        _cloudinaryServiceMock.Setup(x => x.DestroyAsync(It.IsAny<DeletionParams>()))
            .ReturnsAsync(new DeletionResult { Result = "failed" });

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(
            () => _testService.InvokeDeleteImagesAsync(imageUrls));
    }
}

// Helper class to test private method
public static class TestServiceExtensions
{
    public static Task InvokeDeleteImagesAsync(this TestService service, List<string> imageUrls)
    {
        var method = typeof(TestService).GetMethod("DeleteImagesAsync",
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        return (Task)method.Invoke(service, new object[] { imageUrls });
    }
}
