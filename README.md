# supabase-to-xata 🦋

Port a Supabase schema to Xata

## Data-type maps 🗺

| Supabase       | Xata   |
| -------------- | ------ |
| text           | string |
| date           | text   |
| boolean        | bool   |
| bigint         | int    |
| `foreignKey`\* | link   |

\* `foreignKey` is not a data-type in Supabase, it's a linked relationship between tables. But in Xata it is described as a data-type within the schema, so we translate as such.

## Getting ready ✨

1. make sure to have a `.env` file. Use `.env.template` as reference

2. get the schema information from your Supabase Dashboard.

The Supabase SDK does not offer a way to pull the whole public database schema. So in order to do that, this script requires you to run 2 queries within the SQL Editor and export them as `csv` files.

### Each column name and data-type 🧭

```sql
SELECT
    table_name,
    column_name,
    data_type
FROM
    information_schema.columns
WHERE
    table_schema = 'public';
```

### Foreign-keys in the schema 🛂

> 💡 skip this step if your schema has no relations

```sql
SELECT
	tableConstraints.constraint_name AS ForeignKeyConstraintName,
	tableConstraints.table_name AS TableName,
	keyColumnUsage.column_name AS ColumnName,
	constraintColumnUsage.table_name AS ForeignKeyTableName,
	constraintColumnUsage.column_name AS ForeignKeyColumn
FROM information_schema.table_constraints AS tableConstraints

JOIN information_schema.key_column_usage AS keyColumnUsage
	ON tableConstraints.constraint_name = keyColumnUsage.constraint_name

JOIN information_schema.constraint_column_usage AS constraintColumnUsage
	ON constraintColumnUsage.constraint_name = tableConstraints.constraint_name

WHERE tableConstraints.constraint_type = 'FOREIGN KEY' AND tableConstraints.table_schema='public';
```

## Run it 🦋

```sh
npx supabase-to-xata \
	--data-types ./csv/data-types.csv \
	--foreign-keys ./csv/foreign-keys.csv
```

## CLI 🔧

| short | long             | description                              |
| ----- | ---------------- | ---------------------------------------- |
| `-t`  | `--data-types`   | path to the **data-types** `.csv` file   |
| `-k`  | `--foreign-keys` | path to the **foreign keys** `.csv` file |
