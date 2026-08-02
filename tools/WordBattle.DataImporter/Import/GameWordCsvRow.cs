using System.Globalization;

namespace WordBattle.DataImporter.Import;

public sealed record GameWordCsvRow(
    int RowNumber,
    Guid Id,
    string Text,
    int Length,
    bool IsActive,
    bool CanBeTarget,
    DateTime? CreatedAt,
    int? Frequency,
    int? FrequencyRank,
    string? Source)
{
    private static readonly CultureInfo TurkishCulture = CultureInfo.GetCultureInfo("tr-TR");

    public static string NormalizeText(string text)
    {
        return text.Trim().ToUpper(TurkishCulture);
    }
}
