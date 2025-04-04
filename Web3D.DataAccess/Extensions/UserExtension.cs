﻿using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

using Web3D.Domain.Models;
using Web3D.Domain.Filters;
using Web3D.Domain.Models.DTO;

namespace Web3D.DataAccess.Extensions;

public static class UserExtension
{
    public static IQueryable<User> Filter(this IQueryable<User> query, Filter filter)
    {
        // TODO: improve search
        if (!string.IsNullOrEmpty(filter.SearchText))
        {
            string nameLower = filter.SearchText.ToLower();
            query = query.Where(x => (x.LastName + " " + x.FirstName + (x.MiddleName != null ? " " + x.MiddleName : ""))
                .ToLower()
                .Contains(nameLower));
        }

        if (filter.UserId is not null)
        {
            query = query.Where(x => x.Id == filter.UserId);
        }

        return query;
    }

    public static IQueryable<User> Sort(this IQueryable<User> query, SortParams sortParams)
    {
        return sortParams.SortDirection == SortDirection.Descending
            ? query.OrderByDescending(GetKeySelector(sortParams.OrderBy))
            : query.OrderBy(GetKeySelector(sortParams.OrderBy));
    }

    public static async Task<PageResult<UserDTO>> ToPagedAsync(this IQueryable<User> query, PageParams pageParams, CancellationToken cancellationToken = default)
    {
        var count = await query.CountAsync(cancellationToken);

        if (count <= 0) return new PageResult<UserDTO>([], 0);

        var page = pageParams.CurrentPage ?? 1;
        var pageSize = pageParams.PageSize ?? 10;

        var result = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new UserDTO
            {
                Id = x.Id,
                LastName = x.LastName,
                FirstName = x.FirstName,
                MiddleName = x.MiddleName,
                Role = x.Role
            })
            .ToArrayAsync(cancellationToken);

        return new PageResult<UserDTO>(result, count);
    }

    private static Expression<Func<User, object>> GetKeySelector(string? orderBy)
    {
        return orderBy switch
        {
            nameof(User.Role) => x => x.Role,
            _ => x => x.LastName + " " + x.FirstName + (x.MiddleName != null ? " " + x.MiddleName : string.Empty)
        };
    }
}