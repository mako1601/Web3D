using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.Domain.Exceptions;
using Web3D.DataAccess.Abstractions;
using Web3D.BusinessLogic.Abstractions;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System;

namespace Web3D.BusinessLogic.Services;

using Utils = Utils.Utils;

public class ArticleService(
    IArticleRepository articleRepository,
    Cloudinary cloudinary)
    : IArticleService
{
    public async Task CreateAsync(
        long authorId,
        string title,
        string? description,
        string contentUrl,
        CancellationToken cancellationToken = default)
    {
        var article = new Article
        {
            UserId = authorId,
            Title = title,
            Description = description,
            ContentUrl = contentUrl,
            CreatedAt = DateTime.UtcNow,
        };

        await articleRepository.CreateAsync(article, cancellationToken);
    }

    public async Task<Article?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var article = await articleRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new ArticleNotFoundException();
        return article;
    }

    public async Task<PageResult<Article>> GetAllAsync(
        Filter filter,
        SortParams sortParams,
        PageParams pageParams,
        CancellationToken cancellationToken = default)
    {
        var articles = await articleRepository.GetAllAsync(filter, sortParams, pageParams, cancellationToken);
        return articles;
    }

    public async Task UpdateAsync(
        long id,
        string title,
        string? description,
        string contentUrl,
        CancellationToken cancellationToken = default)
    {
        var article = await articleRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new ArticleNotFoundException();

        article.Title = title;
        article.Description = description;
        article.ContentUrl = contentUrl;
        article.UpdatedAt = DateTime.UtcNow;

        await articleRepository.UpdateAsync(article, cancellationToken);
    }

    public async Task DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var article = await articleRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new ArticleNotFoundException();

        var json = string.Empty;
        using var httpClient = new HttpClient();
        try
        {
            var response = await httpClient.GetAsync(article.ContentUrl, cancellationToken);
            response.EnsureSuccessStatusCode();
            json = await response.Content.ReadAsStringAsync(cancellationToken);
        }
        catch
        {
            throw new Exception($"Ошибка загрузки JSON: {article.ContentUrl}");
        }

        var imageUrls = new List<string>();
        using (JsonDocument doc = JsonDocument.Parse(json))
        {
            foreach (var element in doc.RootElement.GetProperty("content").EnumerateArray())
            {
                if (element.TryGetProperty("content", out var content))
                {
                    foreach (var innerElement in content.EnumerateArray())
                    {
                        if (innerElement.TryGetProperty("type", out var type) &&
                            type.GetString() == "image" &&
                            innerElement.TryGetProperty("attrs", out var attrs) &&
                            attrs.TryGetProperty("src", out var src))
                        {
                            imageUrls.Add(src.GetString()!);
                        }
                    }
                }
            }
        }

        foreach (var url in imageUrls)
        {
            var imagePublicId = Utils.ExtractPublicIdFromUrl(url);
            if (!string.IsNullOrEmpty(imagePublicId))
            {
                var imageDeleteParams = new DeletionParams(imagePublicId)
                {
                    ResourceType = ResourceType.Image,
                    Invalidate = true
                };
                await cloudinary.DestroyAsync(imageDeleteParams);
            }
        }

        var jsonDeleteParams = new DeletionParams(Utils.ExtractPublicIdFromUrl(article.ContentUrl) + ".json")
        {
            ResourceType = ResourceType.Raw,
            Invalidate = true
        };
        await cloudinary.DestroyAsync(jsonDeleteParams);

        await articleRepository.DeleteAsync(article, cancellationToken);
    }
}
