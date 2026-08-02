using System.Globalization;
using Microsoft.VisualBasic.FileIO;
using WordBattle.DataImporter.Import;

namespace WordBattle.DataImporter.Validation;

public sealed class GameWordCsvValidator
{
    private static readonly string[] RequiredHeaders =
    [
        "Id",
        "Text",
        "Length",
        "IsActive",
        "CanBeTarget",
        "CreatedAt",
        "Frequency",
        "FrequencyRank",
        "Source"
    ];

    public GameWordCsvValidationResult Validate(string gameWordsPath, string targetWordsPath)
    {
        var gameResult = ReadRows(gameWordsPath, "game");
        var targetResult = ReadRows(targetWordsPath, "target");
        var errors = gameResult.Errors.Concat(targetResult.Errors).ToList();

        if (errors.Count == 0)
        {
            errors.AddRange(ValidateTargetRelation(gameResult.Rows, targetResult.Rows));
        }

        return new GameWordCsvValidationResult(
            errors.Count == 0,
            gameResult.Rows,
            targetResult.Rows,
            errors);
    }

    public IReadOnlyList<string> ValidateRows(
        IReadOnlyList<GameWordCsvRow> gameRows,
        IReadOnlyList<GameWordCsvRow> targetRows)
    {
        return ValidateTargetRelation(gameRows, targetRows).ToList();
    }

    private static ParsedCsv ReadRows(string path, string label)
    {
        var rows = new List<GameWordCsvRow>();
        var errors = new List<string>();

        if (!File.Exists(path))
        {
            errors.Add($"{label}: CSV file was not found: {path}");
            return new ParsedCsv(rows, errors);
        }

        using var parser = new TextFieldParser(path);
        parser.SetDelimiters(",");
        parser.HasFieldsEnclosedInQuotes = true;
        parser.TrimWhiteSpace = false;

        var headers = parser.ReadFields()?.Select(RemoveBom).ToArray();
        if (headers is null)
        {
            errors.Add($"{label}: CSV header is missing.");
            return new ParsedCsv(rows, errors);
        }

        if (!headers.SequenceEqual(RequiredHeaders, StringComparer.Ordinal))
        {
            errors.Add($"{label}: CSV headers are invalid. Actual: {string.Join(", ", headers)}");
            return new ParsedCsv(rows, errors);
        }

        var seenTexts = new Dictionary<string, int>(StringComparer.Ordinal);
        var rowNumber = 1;

        while (!parser.EndOfData)
        {
            rowNumber++;
            string[]? fields;
            try
            {
                fields = parser.ReadFields();
            }
            catch (MalformedLineException exception)
            {
                errors.Add($"{label} row {parser.ErrorLineNumber}: malformed CSV line. {exception.Message}");
                continue;
            }

            if (fields is null || fields.Length != RequiredHeaders.Length)
            {
                errors.Add($"{label} row {rowNumber}: expected {RequiredHeaders.Length} fields.");
                continue;
            }

            var row = ParseRow(label, rowNumber, fields, errors);
            if (row is null)
            {
                continue;
            }

            if (seenTexts.TryGetValue(row.Text, out var previousRow))
            {
                errors.Add($"{label} row {rowNumber}: duplicate Text '{row.Text}' also appears at row {previousRow}.");
                continue;
            }

            seenTexts[row.Text] = rowNumber;
            rows.Add(row);
        }

        return new ParsedCsv(rows, errors);
    }

    private static GameWordCsvRow? ParseRow(
        string label,
        int rowNumber,
        IReadOnlyList<string> fields,
        List<string> errors)
    {
        var rowErrors = new List<string>();
        var normalizedText = GameWordCsvRow.NormalizeText(fields[1]);

        if (!Guid.TryParse(fields[0], out var id))
        {
            rowErrors.Add("Id is not a valid Guid.");
        }

        if (string.IsNullOrWhiteSpace(fields[1]))
        {
            rowErrors.Add("Text is empty.");
        }

        if (string.IsNullOrWhiteSpace(normalizedText))
        {
            rowErrors.Add("Text is empty after normalization.");
        }

        if (!int.TryParse(fields[2], NumberStyles.None, CultureInfo.InvariantCulture, out var length))
        {
            rowErrors.Add("Length is not a valid integer.");
        }
        else
        {
            if (length <= 0)
            {
                rowErrors.Add("Length must be greater than zero.");
            }

            if (length != normalizedText.Length)
            {
                rowErrors.Add($"Text '{normalizedText}' has length {normalizedText.Length}, expected {length}.");
            }

            if (normalizedText.Length != 5)
            {
                rowErrors.Add($"Text '{normalizedText}' has length {normalizedText.Length}, expected 5.");
            }
        }

        if (!bool.TryParse(fields[3], out var isActive))
        {
            rowErrors.Add("IsActive is not a valid bool.");
        }

        if (!bool.TryParse(fields[4], out var canBeTarget))
        {
            rowErrors.Add("CanBeTarget is not a valid bool.");
        }

        DateTime? createdAt = null;
        if (!string.IsNullOrWhiteSpace(fields[5]))
        {
            if (DateTime.TryParse(
                    fields[5],
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal,
                    out var parsedCreatedAt))
            {
                createdAt = DateTime.SpecifyKind(parsedCreatedAt, DateTimeKind.Utc);
            }
            else
            {
                rowErrors.Add("CreatedAt is not a valid date.");
            }
        }

        var frequency = ParseNullableInt(fields[6], "Frequency", rowErrors);
        var frequencyRank = ParseNullableInt(fields[7], "FrequencyRank", rowErrors);
        var source = string.IsNullOrWhiteSpace(fields[8]) ? null : fields[8].Trim();

        if (rowErrors.Count > 0)
        {
            errors.AddRange(rowErrors.Select(error => $"{label} row {rowNumber}: {error}"));
            return null;
        }

        return new GameWordCsvRow(
            rowNumber,
            id,
            normalizedText,
            length,
            isActive,
            canBeTarget,
            createdAt,
            frequency,
            frequencyRank,
            source);
    }

    private static int? ParseNullableInt(string value, string fieldName, List<string> errors)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        if (int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed))
        {
            return parsed;
        }

        errors.Add($"{fieldName} is not a valid integer.");
        return null;
    }

    private static IEnumerable<string> ValidateTargetRelation(
        IReadOnlyList<GameWordCsvRow> gameRows,
        IReadOnlyList<GameWordCsvRow> targetRows)
    {
        var errors = new List<string>();
        var gameByText = gameRows.ToDictionary(row => row.Text, StringComparer.Ordinal);

        foreach (var target in targetRows)
        {
            if (!gameByText.TryGetValue(target.Text, out var game))
            {
                errors.Add($"target row {target.RowNumber}: Text '{target.Text}' does not exist in game words.");
                continue;
            }

            if (game.Id != target.Id)
            {
                errors.Add($"target row {target.RowNumber}: Id for '{target.Text}' does not match game words.");
            }

            if (!game.CanBeTarget)
            {
                errors.Add($"target row {target.RowNumber}: Text '{target.Text}' is not marked CanBeTarget=true in game words.");
            }

            if (!target.IsActive || !game.IsActive)
            {
                errors.Add($"target row {target.RowNumber}: Text '{target.Text}' is not active.");
            }

            if (target.Length != 5 || game.Length != 5 || target.Text.Length != 5)
            {
                errors.Add($"target row {target.RowNumber}: Text '{target.Text}' is not length 5.");
            }
        }

        return errors;
    }

    private static string RemoveBom(string header)
    {
        return header.TrimStart('\uFEFF');
    }

    private sealed record ParsedCsv(IReadOnlyList<GameWordCsvRow> Rows, IReadOnlyList<string> Errors);
}

public sealed record GameWordCsvValidationResult(
    bool Success,
    IReadOnlyList<GameWordCsvRow> GameWords,
    IReadOnlyList<GameWordCsvRow> TargetWords,
    IReadOnlyList<string> Errors);
