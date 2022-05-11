import type { XataSchema, SupabaseSchema } from './types';
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL = '', SUPABASE_KEY = '' } = process.env;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const getSupabaseData = async (
  tablesNames: string[]
): Promise<SupabaseSchema> => {
  const supabaseData = await Promise.all(
    tablesNames.map(async (tableName) => {
      const raw = await supabase.from<any>(tableName).select('*');

      // for (const item of raw.data) {
      //   // Supabase IDs don't match Xata IDs
      //   // if we push IDs to Xata, the insert will fail
      //   delete item['id'];
      // }

      return raw;
    })
  );

  return supabaseData.reduce<SupabaseSchema>((acc, curr, idx) => {
    acc[tablesNames[idx]] = curr.data ?? [];

    return acc;
  }, {});
};

export const mapSchemaTypes = {
  text: 'string',
  date: 'text',
  boolean: 'bool',
  bigint: 'int',
} as const;

export const getTablesNames = (dataTypes: XataSchema) => Object.keys(dataTypes);
