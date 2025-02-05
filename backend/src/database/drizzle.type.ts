import { NodePgDatabase } from 'drizzle-orm/node-postgres/driver';

import * as schema from './drizzle.schema';

export type DrizzleDb = NodePgDatabase<typeof schema>;
