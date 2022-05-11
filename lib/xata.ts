import type { SupabaseSchema, XataJunctionSchema } from './types';
import type { XataApiClient } from '@xata.io/client';
import type { Column } from '@xata.io/client/dist/api/schemas';

const {
  XATA_WORKSPACE_ID = '',
  XATA_DB_NAME = '',
  XATA_BRANCH = '',
} = process.env;

/**
 * @TODO
 * add option to let Xata create IDs
 * and still be able to push relations
 */
export const pushTablesToXata = async (
  supabase: {
    data: SupabaseSchema;
    schema: any;
  },
  xata: XataApiClient,
  preserveIds = false
) => {
  const { data: supData, schema: sbSchema } = supabase;

  for (const [tableName, tableRecords] of Object.entries<
    Record<string, unknown>[]
  >(supData)) {
    const tableSchema = [] as Column[];

    for (const [column, type] of Object.entries<string>(sbSchema[tableName])) {
      tableSchema.push({
        name: column,
        type: type as Column['type'],
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

    if (preserveIds) {
      await xata.records.bulkInsertTableRecords(
        XATA_WORKSPACE_ID,
        XATA_DB_NAME,
        XATA_BRANCH,
        tableName,
        tableRecords
      );
    } else {
      for (const record of tableRecords) {
        const { id, ...rest } = record;

        await xata.records.insertRecordWithID(
          XATA_WORKSPACE_ID,
          XATA_DB_NAME,
          XATA_BRANCH,
          tableName,
          String(id),
          rest
        );
      }
    }
  }
};

export const pushJunctionsToXata = async (
  foreignKeysSchema: XataJunctionSchema,
  foreignKeyRecords: Record<string, string>[],
  xata: XataApiClient
) => {
  for (const tableName of Object.keys(foreignKeysSchema)) {
    await xata.tables.setTableSchema(
      XATA_WORKSPACE_ID,
      XATA_DB_NAME,
      XATA_BRANCH,
      tableName,
      {
        columns: foreignKeysSchema[tableName],
      }
    );
  }

  for (const foreignKeyTable of Object.keys(foreignKeysSchema)) {
    try {
      await xata.records.bulkInsertTableRecords(
        XATA_WORKSPACE_ID,
        XATA_DB_NAME,
        XATA_BRANCH,
        foreignKeyTable,
        foreignKeyRecords
      );
    } catch (err) {
      console.error('Error on bulk insert junction', err);
    }
  }
};

export const createTables = async (
  regularTables: string[],
  junctions: string[],
  xata: XataApiClient
) => {
  await Promise.all(
    [...regularTables, ...junctions].map((newTable) =>
      xata.tables.createTable(
        XATA_WORKSPACE_ID,
        XATA_DB_NAME,
        XATA_BRANCH,
        newTable
      )
    )
  );
};
