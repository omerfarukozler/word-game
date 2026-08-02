using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using WordBattle.DataImporter.Import;
using WordBattle.DataImporter.Validation;
using WordBattle.Infrastructure.Persistence;
using WordBattle.Infrastructure.Words;

var parseResult = GameWordImportOptions.TryParse(args, Directory.GetCurrentDirectory());

if (!parseResult.Success || parseResult.Options is null)
{
    Console.Error.WriteLine(parseResult.ErrorMessage);
    Console.Error.WriteLine();
    Console.Error.WriteLine(GameWordImportOptions.HelpText);
    return 2;
}

try
{
    var options = parseResult.Options;
    var startedAt = DateTimeOffset.UtcNow;
    var validator = new GameWordCsvValidator();
    var validationResult = validator.Validate(options.FilePath, options.TargetFilePath);

    if (!validationResult.Success)
    {
        Console.Error.WriteLine("Validation failed.");

        foreach (var error in validationResult.Errors.Take(50))
        {
            Console.Error.WriteLine(error);
        }

        if (validationResult.Errors.Count > 50)
        {
            Console.Error.WriteLine($"... {validationResult.Errors.Count - 50} more validation errors.");
        }

        return 1;
    }

    Console.WriteLine("Validation successful.");

    await using var dbContext = CreateDbContext(options.RepositoryRoot);
    var importer = new GameWordCsvImporter(dbContext);
    var result = await importer.ImportAsync(validationResult.GameWords, options, CancellationToken.None);
    result.Elapsed = DateTimeOffset.UtcNow - startedAt;

    PrintResult(result, options);
    await PrintDatabaseVerificationAsync(dbContext);

    return 0;
}
catch (Exception exception)
{
    Console.Error.WriteLine(exception.Message);
    return 1;
}

static GameDbContext CreateDbContext(string repositoryRoot)
{
    var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

    if (string.IsNullOrWhiteSpace(connectionString))
    {
        var apiProjectPath = Path.Combine(repositoryRoot, "src", "WordBattle.Api");
        var appSettingsConnectionString = new ConfigurationBuilder()
            .SetBasePath(apiProjectPath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build()
            .GetConnectionString("DefaultConnection");

        connectionString = appSettingsConnectionString;
    }

    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");
    }

    var options = new DbContextOptionsBuilder<GameDbContext>()
        .UseNpgsql(connectionString)
        .Options;

    return new GameDbContext(options);
}

static void PrintResult(GameWordImportResult result, GameWordImportOptions options)
{
    Console.WriteLine($"File: {options.FilePath}");
    Console.WriteLine($"Total rows: {result.TotalRows}");
    Console.WriteLine($"Existing records: {result.ExistingRecords}");
    Console.WriteLine($"Inserted: {result.Inserted}");
    Console.WriteLine($"Updated: {result.Updated}");
    Console.WriteLine($"Unchanged: {result.Unchanged}");
    Console.WriteLine($"Deactivated: {result.Deactivated}");
    Console.WriteLine($"Failed: {result.Failed}");
    Console.WriteLine($"Active words: {result.ActiveWords}");
    Console.WriteLine($"Target words: {result.TargetWords}");
    Console.WriteLine($"Non-target words: {result.NonTargetWords}");
    Console.WriteLine($"Elapsed time: {result.Elapsed.TotalSeconds:0.00}s");

    if (options.DryRun)
    {
        Console.WriteLine("Dry run completed. No database changes were made.");
    }
}

static async Task PrintDatabaseVerificationAsync(GameDbContext dbContext)
{
    var totalWords = await dbContext.GameWords.CountAsync();
    var activeTargetWords = await dbContext.GameWords.CountAsync(word =>
        word.IsActive &&
        word.CanBeTarget &&
        word.Length == 5);
    var activeNonTargetWords = await dbContext.GameWords.CountAsync(word =>
        word.IsActive &&
        !word.CanBeTarget);
    var duplicateTextGroups = await dbContext.GameWords
        .GroupBy(word => word.Text)
        .Where(group => group.Count() > 1)
        .CountAsync();
    var invalidLengthRows = await dbContext.GameWords.CountAsync(word =>
        word.Length != 5 ||
        word.Text.Length != 5);

    string? providerSample = null;

    if (activeTargetWords > 0)
    {
        var provider = new DatabaseWordProvider(dbContext);
        providerSample = await provider.GetRandomWordAsync(5);
    }

    Console.WriteLine("Database verification:");
    Console.WriteLine($"Total words: {totalWords}");
    Console.WriteLine($"Active target words: {activeTargetWords}");
    Console.WriteLine($"Duplicate text groups: {duplicateTextGroups}");
    Console.WriteLine($"Invalid length rows: {invalidLengthRows}");
    Console.WriteLine($"Active non-target words: {activeNonTargetWords}");
    Console.WriteLine($"Provider sample length: {providerSample?.Length.ToString() ?? "none"}");
}
