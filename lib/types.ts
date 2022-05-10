import { mapSchemaTypes } from './supabase';

export type DataTypeMap = [string, string, string][];
export type SupabaseSchema = {
  [tableName: string]: {
    [key: string]: string;
  }[];
};

export type XataJunctionTables = {
  [name: string]: {
    name: string;
    type: 'link';
    link: {
      table: string;
    };
  }[];
};

export type ForeignKeys = {
  [tableName: string]: {
    originColumn: string;
    foreignTable: string;
    foreignColumn: string;
  };
};

export type Schema = {
  [tableName: string]: {
    [columnName: string]: keyof typeof mapSchemaTypes;
  };
};

export type XataJunctionSchema = {
  [junctionName: string]: [
    {
      name: string;
      type: 'link';
      link: {
        table: string;
      };
    },
    {
      name: string;
      type: 'link';
      link: {
        table: string;
      };
    }
  ];
};
