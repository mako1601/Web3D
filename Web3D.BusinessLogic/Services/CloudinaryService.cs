using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Web3D.BusinessLogic.Abstractions;

namespace Web3D.BusinessLogic.Services;

public class CloudinaryService(Cloudinary cloudinary) : ICloudinaryService
{
    public async Task<DeletionResult> DestroyAsync(DeletionParams deletionParams)
    {
        return await cloudinary.DestroyAsync(deletionParams);
    }
}