import 'dotenv/config';
import 'node-fetch';
import { XataApiClient } from '@xata.io/client';
import { Command } from 'commander';
import * as pkg from '../package.json';
import { getSupabaseData, getTablesNames } from './supabase';
import { pushTablesToXata, pushJunctionsToXata, createTables } from './xata';
import {
  formatDataTypes,
  fkToJunction,
  getJunctionRecords,
} from './handle-csv';

const { XATA_KEY = '' } = process.env;

const program = new Command();

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.name)
  .option('-t, --data-types <path>', 'path for the data types')
  .option('-k, --foreign-keys <path>', 'path to the foreign keys');

program.parse(process.argv);

const { dataTypes, foreignKeys } = program.opts() as Record<
  'dataTypes' | 'foreignKeys',
  string
>;

const xata = new XataApiClient({
  apiKey: XATA_KEY,
  fetch,
});

const sbSchemaXataTypes = dataTypes
  ? formatDataTypes(dataTypes).then((r) => r)
  : {};
const foreignKeysSchema = foreignKeys ? await fkToJunction(foreignKeys) : {};

const sb = {
  data: await getSupabaseData(getTablesNames(sbSchemaXataTypes)),
  schema: sbSchemaXataTypes,
};

await createTables(
  getTablesNames(sbSchemaXataTypes),
  Object.keys(foreignKeysSchema),
  xata
);

await pushTablesToXata(sb, xata);
await pushJunctionsToXata(
  foreignKeysSchema,
  await getJunctionRecords(foreignKeys, sb.data),
  xata
);
