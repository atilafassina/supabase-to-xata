import type { SupabaseSchema } from './types';
import type { DataTypeMap, XataJunctionSchema } from './types';
import type { Schema } from './types';
import { resolve } from 'path';
import { promises as fs } from 'fs';
import papa from 'papaparse';
import { mapSchemaTypes } from './supabase';

const { parse: parseCsv } = papa;

const csvToJson = async (csvPath: string): Promise<string[][]> => {
  const csv = parseCsv(
    await fs.readFile(resolve(process.cwd(), csvPath), 'utf8')
  ) as { data: string[][] };

  return csv.data.splice(1);
};

export const formatDataTypes = async (csvPath: string) => {
  const csvData = (await csvToJson(csvPath)) as DataTypeMap;

  return csvData.reduce<Schema>((json, [tableName, columnName, dataType]) => {
    if (columnName !== 'id') {
      json[tableName] = {
        ...json[tableName],
        [columnName]: mapSchemaTypes[dataType],
      };
    }

    return json;
  }, {});
};

export const getJunctionRecords = async (
  csvPath: string,
  supabaseData: SupabaseSchema
): Promise<Record<string, string>[]> => {
  const [, tableName, fkColumn, fkTargetTable] = (await csvToJson(csvPath))[0];

  return supabaseData[tableName].reduce((schema, item) => {
    schema.push({
      [tableName]: String(item.id),
      [fkTargetTable]: String(item[fkColumn]),
    });

    return schema;
  }, []);
};

export const fkToJunction = async (
  csvPath: string
): Promise<XataJunctionSchema> => {
  const csvData = await csvToJson(csvPath);

  return csvData.reduce(
    (
      json,
      [
        ,
        // `foreignkeyconstraintname` not needed
        tablename,
        columnname,
        foreignkeytablename,
        foreignkeycolumn,
      ]
    ) => {
      json[`junction_${tablename}_${foreignkeytablename}`] = [
        {
          name: tablename,
          type: 'link',
          link: {
            table: foreignkeytablename,
          },
        },
        {
          name: foreignkeytablename,
          type: 'link',
          link: {
            table: tablename,
          },
        },
      ];

      return json;
    },
    {}
  );
};
