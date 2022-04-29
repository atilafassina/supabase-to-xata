import 'dotenv/config';
import 'node-fetch';
import {
  getSupabaseData,
  mapSchemaTypes,
  schema as sbSchema,
} from './supabase';
import type { SupabaseTableNames, SupabaseSchema } from './supabase';
import { settings } from './config';
import { XataApiClient } from '@xata.io/client';
import { Column } from '@xata.io/client/dist/api/schemas';

const { XATA_WORKSPACE_ID, XATA_DB_NAME, XATA_BRANCH, XATA_KEY } = process.env;

const xata = new XataApiClient({
  apiKey: XATA_KEY,
  fetch,
});

await Promise.all(
  settings.tables.map((newTable) =>
    xata.tables.createTable(
      XATA_WORKSPACE_ID,
      XATA_DB_NAME,
      XATA_BRANCH,
      newTable
    )
  )
);

const supabaseData = await getSupabaseData(settings.tables);

for (const [tableName, tableRecords] of Object.entries<
  SupabaseSchema[keyof SupabaseSchema]
>(supabaseData)) {
  const tableSchema = [] as Column[];

  for (const [column, type] of Object.entries<SupabaseTableNames>(
    sbSchema[tableName]
  )) {
    tableSchema.push({
      name: column,
      type: mapSchemaTypes[type],
    });
  }

  await xata.tables.setTableSchema(
    XATA_WORKSPACE_ID,
    XATA_DB_NAME,
    XATA_BRANCH,
    tableName,
    {
      columns: tableSchema,
    }
  );

  await xata.records.bulkInsertTableRecords(
    XATA_WORKSPACE_ID,
    XATA_DB_NAME,
    XATA_BRANCH,
    tableName,
    tableRecords
  );
}
