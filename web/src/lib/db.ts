import { neon } from '@neondatabase/serverless';

let _sql: any = null;

function getDb() {
  if (!_sql) {
    const url = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/medigo';
    _sql = neon(url);
  }
  return _sql;
}

export interface SqlQuery {
  (strings: TemplateStringsArray, ...values: any[]): Promise<Record<string, any>[]>;
  <T = Record<string, any>>(strings: TemplateStringsArray, ...values: any[]): Promise<T[]>;
}

const sql = ((strings: TemplateStringsArray, ...values: any[]) => {
  const client = getDb();
  return client(strings, ...values);
}) as unknown as SqlQuery;

export default sql;
