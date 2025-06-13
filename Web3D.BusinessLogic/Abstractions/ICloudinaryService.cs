using CloudinaryDotNet.Actions;

namespace Web3D.BusinessLogic.Abstractions;

public interface ICloudinaryService
{
    Task<DeletionResult> DestroyAsync(DeletionParams deletionParams);
}