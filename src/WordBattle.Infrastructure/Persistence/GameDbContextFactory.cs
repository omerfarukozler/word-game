using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace WordBattle.Infrastructure.Persistence;

public sealed class GameDbContextFactory : IDesignTimeDbContextFactory<GameDbContext>
{
    public GameDbContext CreateDbContext(string[] args)
    {
        var apiProjectPath = Path.GetFullPath(
            Path.Combine(AppContext.BaseDirectory, "../../../../WordBattle.Api"));

        if (!Directory.Exists(apiProjectPath))
        {
            apiProjectPath = Path.GetFullPath(
                Path.Combine(Directory.GetCurrentDirectory(), "src/WordBattle.Api"));
        }

        var configuration = new ConfigurationBuilder()
            .SetBasePath(apiProjectPath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured for design-time GameDbContext creation.");
        }

        var optionsBuilder = new DbContextOptionsBuilder<GameDbContext>();

        optionsBuilder.UseNpgsql(connectionString);

        return new GameDbContext(optionsBuilder.Options);
    }
}
