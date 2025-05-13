namespace Web3D.BusinessLogic.Utils;

internal static class Utils
{
    public static string? ExtractPublicIdFromUrl(string url)
    {
        try
        {
            var uri = new Uri(url);
            var segments = uri.Segments;
            var lastSegment = segments.Last();
            return Path.GetFileNameWithoutExtension(lastSegment);
        }
        catch
        {
            return null;
        }
    }
}
