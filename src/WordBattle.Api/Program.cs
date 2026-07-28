using FluentValidation.AspNetCore;
using WordBattle.Api.Hubs;
using WordBattle.Api.Middleware;
using WordBattle.Api.Realtime;
using WordBattle.Application;
using WordBattle.Application.Interfaces;
using WordBattle.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IGameNotifier, SignalRGameNotifier>();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentCors", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5500",
                "http://127.0.0.1:5500")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("DevelopmentCors");

app.UseAuthorization();

app.MapControllers();
app.MapHub<GameHub>("/hubs/game");

app.Run();
