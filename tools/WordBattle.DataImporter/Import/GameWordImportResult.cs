namespace WordBattle.DataImporter.Import;

public sealed class GameWordImportResult
{
    public int TotalRows { get; init; }

    public int ExistingRecords { get; init; }

    public int Inserted { get; set; }

    public int Updated { get; set; }

    public int Unchanged { get; set; }

    public int Deactivated { get; set; }

    public int Failed { get; set; }

    public int ActiveWords { get; set; }

    public int TargetWords { get; set; }

    public int NonTargetWords { get; set; }

    public TimeSpan Elapsed { get; set; }
}
