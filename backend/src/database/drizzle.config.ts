import { PG_MIGRATIONS_PATH, PG_SCHEMA_PATH } from 'app.definition';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: PG_SCHEMA_PATH,
  out: PG_MIGRATIONS_PATH,
  dialect: 'postgresql',
  dbCredentials: {
    host: String(process.env.APP_DB_HOST),
    port: Number(process.env.APP_DB_PORT),
    user: String(process.env.APP_DB_USER),
    password: String(process.env.APP_DB_PASSWORD),
    database: String(process.env.APP_DB_NAME),
  },
});
