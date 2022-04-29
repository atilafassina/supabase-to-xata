import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_KEY } = process.env;

interface SupabaseTables {
  Categories: {
    id: number;
    type: string;
  }[];
  Articles: {
    id: number;
    published_at: string;
    title: string;
    description: string;
    platform?: 'smashing' | 'css-tricks' | 'dev-to';
    url: string;
  }[];

  Appearances: {
    id: number;
    name: string;
    title: string;
    type: 'conference' | 'podcast' | 'workshop' | 'meetup';
    date: string;
    description: string;
    recording: string;
    slides: string;
    url: string;
    published: boolean;
  }[];

  Now: {
    id: string;
    name: string;
  }[];
}
export type SupabaseTableNames =
  | 'now'
  | 'articles'
  | 'appearances'
  | 'categories';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 *
 * @param {string[]} tableNames
 */
export const getSupabaseData = async (
  tablesNames: SupabaseTableNames[]
): Promise<SupabaseSchema> => {
  const supabaseData = await Promise.all(
    tablesNames.map(async (tableName) => {
      const raw = await supabase
        .from<SupabaseTables[Capitalize<SupabaseTableNames>][]>(tableName)
        .select('*');

      for (const item of raw.data) {
        // Supabase IDs don't match Xata IDs
        // if we push IDs to Xata, the insert will fail
        delete item['id'];
      }

      return raw;
    })
  );

  return supabaseData.reduce<SupabaseSchema>((acc, curr, idx) => {
    acc[tablesNames[idx]] = curr.data;

    return acc;
  }, {} as SupabaseSchema);
};

/**
 * Postgrest doesn't support `WHERE` so we need to fetch the data tables straight from SQL Editor
 * copy the query from the Readme
 * @see {link-to-readme}
 */
export const schema = {
  now: {
    name: 'text',
  },

  articles: {
    published_at: 'date',
    title: 'text',
    description: 'text',
    platform: 'text',
    url: 'text',
  },

  appearances: {
    date: 'date',
    name: 'text',
    title: 'text',
    description: 'text',
    recording: 'text',
    slides: 'text',
    url: 'text',
    type: 'text',
    published: 'boolean',
    isFuture: 'boolean',
  },
} as const;

export const mapSchemaTypes = {
  text: 'string',
  date: 'text',
  boolean: 'bool',
};

export type SupabaseSchema = {
  now: {
    name?: string;
  }[];
  articles: {
    published_at?: string;
    title?: string;
    description?: string;
    platform?: string;
    url?: string;
  }[];

  appearances: {
    date?: string;
    name?: string;
    title?: string;
    description?: string;
    recording?: string;
    slides?: string;
    url?: string;
    type?: string;
    published?: boolean;
    isFuture?: boolean;
  }[];
};
