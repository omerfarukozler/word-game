using FluentValidation;
using WordBattle.Application.Interfaces;
using WordBattle.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace WordBattle.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddScoped<IRoomService, RoomService>();
        services.AddScoped<IMatchService, MatchService>();

        return services;
    }
}
