import 'dotenv/config';
import * as schema from './schema';

// This project is Postgres-only. Build will fail if DATABASE_URL is not a postgres URL.
const explicitDb = process.env.DATABASE_URL;
let dbUrl: string;
if (explicitDb && explicitDb.length > 0) {
	dbUrl = explicitDb;
} else {
	// Construct a Postgres URL from POSTGRES_* env vars for convenience (useful in compose).
	const user = process.env.POSTGRES_USER ?? 'dev';
	const pass = process.env.POSTGRES_PASSWORD ?? 'pass';
	const host = process.env.POSTGRES_HOST ?? 'postgres';
	const port = process.env.POSTGRES_PORT ?? '5432';
	const name = process.env.POSTGRES_DB ?? 'lpr';
	dbUrl = `postgres://${user}:${pass}@${host}:${port}/${name}`;
}

if (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://')) {
	throw new Error('DATABASE_URL must be a Postgres connection string (postgres://...). SQLite is no longer supported.');
}

let db: any;
let sql: any | undefined;

// Postgres path: use postgres.js + drizzle postgres-js
const postgres = (await import('postgres')).default;
const { drizzle } = await import('drizzle-orm/postgres-js');
sql = postgres(dbUrl, { max: 20 });
db = drizzle(sql, { schema });

export { db, sql };
