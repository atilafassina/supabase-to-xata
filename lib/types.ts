import { mapSchemaTypes } from './supabase';

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

export type XataSchema = {
  [tableName: string]: {
    [columnName: string]: typeof mapSchemaTypes[keyof typeof mapSchemaTypes];
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
