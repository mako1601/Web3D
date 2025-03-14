using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Mvc;

namespace Web3D.API.Controllers;

[ApiController]
[Route("api/cloudinary")]
public class CloudinaryController(Cloudinary cloudinary) : ControllerBase
{
    [HttpPost("upload")]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile file)
    {
        try
        {
            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream)
            };

            var uploadResult = await cloudinary.UploadAsync(uploadParams);

            if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
            {
                return Ok(new { url = uploadResult.SecureUrl.ToString() });
            }
            else
            {
                return StatusCode(500, "Ошибка загрузки изображения");
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка на сервере: " + ex.Message);
        }
    }

    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> DeleteImage([FromRoute] string id)
    {
        try
        {
            var deleteParams = new DeletionParams(id);
            var deleteResult = await cloudinary.DestroyAsync(deleteParams);

            if (deleteResult.StatusCode == System.Net.HttpStatusCode.OK)
            {
                return NoContent();
            }
            else
            {
                return StatusCode(500, "Ошибка удаления изображения");
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Ошибка на сервере: " + ex.Message);
        }
    }
}
