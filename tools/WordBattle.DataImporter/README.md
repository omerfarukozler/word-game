# WordBattle Data Importer

Imports the CSV word dataset into `GameWords` without using EF Core seed data or migration `InsertData`.

## CSV Format

Expected headers:

```text
Id,Text,Length,IsActive,CanBeTarget,CreatedAt,Frequency,FrequencyRank,Source
```

`Text` is trimmed and normalized with Turkish uppercase rules (`tr-TR`). All rows must be valid before any database changes are made.

## Commands

Dry-run:

```bash
dotnet run --project tools/WordBattle.DataImporter -- --file data/words/game-words.csv --target-file data/words/target-words.csv --dry-run
```

Import:

```bash
dotnet run --project tools/WordBattle.DataImporter -- --file data/words/game-words.csv --target-file data/words/target-words.csv
```

The importer is idempotent. It matches existing rows by `GameWord.Text`, inserts missing words, updates changed metadata, and does not delete database-only rows by default.

## Connection String

Resolution order:

1. `ConnectionStrings__DefaultConnection`
2. `src/WordBattle.Api/appsettings.Development.json`
3. `src/WordBattle.Api/appsettings.json`

No connection string is hard-coded in this tool.

## Migration And Deployment Order

1. Apply migrations.
2. Run importer with `--dry-run`.
3. Run importer without `--dry-run`.
4. Run database verification queries.
5. Deploy or start the API.

Do not run this importer automatically from API startup, migrations, or a background worker.

## Verification Queries

```sql
SELECT COUNT(*) FROM "GameWords";

SELECT COUNT(*)
FROM "GameWords"
WHERE "IsActive" = TRUE
  AND "CanBeTarget" = TRUE
  AND "Length" = 5;

SELECT "Text", COUNT(*)
FROM "GameWords"
GROUP BY "Text"
HAVING COUNT(*) > 1;

SELECT "Text", "Length"
FROM "GameWords"
WHERE "Length" <> 5
   OR char_length("Text") <> 5;

SELECT COUNT(*)
FROM "GameWords"
WHERE "IsActive" = TRUE
  AND "CanBeTarget" = FALSE;
```
