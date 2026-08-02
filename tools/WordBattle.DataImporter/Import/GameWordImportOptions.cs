namespace WordBattle.DataImporter.Import;

public sealed record GameWordImportOptions(
    string RepositoryRoot,
    string FilePath,
    string TargetFilePath,
    bool DryRun,
    bool DeactivateMissing)
{
    public const string HelpText = """
Usage:
  dotnet run --project tools/WordBattle.DataImporter -- [options]

Options:
  --file <path>               Game words CSV path. Defaults to data/words/game-words.csv.
  --target-file <path>        Target words CSV path. Defaults to data/words/target-words.csv.
  --dry-run                   Validate and compare without changing the database.
  --deactivate-missing        Mark database-only words inactive instead of leaving them untouched.
""";

    public static ParseResult TryParse(string[] args, string currentDirectory)
    {
        var repositoryRoot = FindRepositoryRoot(currentDirectory);
        var filePath = Path.Combine(repositoryRoot, "data", "words", "game-words.csv");
        var targetFilePath = Path.Combine(repositoryRoot, "data", "words", "target-words.csv");
        var dryRun = false;
        var deactivateMissing = false;

        for (var index = 0; index < args.Length; index++)
        {
            switch (args[index])
            {
                case "--file":
                    if (!TryReadValue(args, ref index, out filePath))
                    {
                        return ParseResult.Failed("--file requires a path.");
                    }

                    filePath = ResolvePath(repositoryRoot, filePath);
                    break;
                case "--target-file":
                    if (!TryReadValue(args, ref index, out targetFilePath))
                    {
                        return ParseResult.Failed("--target-file requires a path.");
                    }

                    targetFilePath = ResolvePath(repositoryRoot, targetFilePath);
                    break;
                case "--dry-run":
                    dryRun = true;
                    break;
                case "--deactivate-missing":
                    deactivateMissing = true;
                    break;
                case "--help":
                case "-h":
                    return ParseResult.Failed(HelpText);
                default:
                    return ParseResult.Failed($"Unknown argument '{args[index]}'.");
            }
        }

        return ParseResult.Ok(new GameWordImportOptions(
            repositoryRoot,
            filePath,
            targetFilePath,
            dryRun,
            deactivateMissing));
    }

    private static bool TryReadValue(string[] args, ref int index, out string value)
    {
        if (index + 1 >= args.Length)
        {
            value = string.Empty;
            return false;
        }

        value = args[++index];
        return !string.IsNullOrWhiteSpace(value);
    }

    private static string ResolvePath(string repositoryRoot, string path)
    {
        return Path.GetFullPath(Path.IsPathRooted(path) ? path : Path.Combine(repositoryRoot, path));
    }

    private static string FindRepositoryRoot(string currentDirectory)
    {
        var directory = new DirectoryInfo(currentDirectory);

        while (directory is not null)
        {
            if (File.Exists(Path.Combine(directory.FullName, "WordBattle.sln")))
            {
                return directory.FullName;
            }

            directory = directory.Parent;
        }

        return currentDirectory;
    }
}

public sealed record ParseResult(bool Success, GameWordImportOptions? Options, string? ErrorMessage)
{
    public static ParseResult Ok(GameWordImportOptions options)
    {
        return new ParseResult(true, options, null);
    }

    public static ParseResult Failed(string errorMessage)
    {
        return new ParseResult(false, null, errorMessage);
    }
}
