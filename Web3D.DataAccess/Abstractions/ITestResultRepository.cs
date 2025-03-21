﻿using Web3D.Domain.Models;

namespace Web3D.DataAccess.Abstractions;

public interface ITestResultRepository
{
    public Task<long> StartTestAsync(TestResult test, CancellationToken cancellationToken = default);
    public Task FinishTestAsync(long testResultId, CancellationToken cancellationToken = default);
    public Task<TestResult?> GetTestResultByIdAsync(long id, CancellationToken cancellationToken = default);
    public Task<long> GetAttemptAsync(long testId, long userId, CancellationToken cancellationToken = default);
}
