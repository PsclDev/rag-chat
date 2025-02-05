import { ConfigService } from '@config';
import { ConfigModule } from '@config/config.module';
import { DrizzleDb, InjectDrizzle } from '@database';
import * as DRIZZLE_SCHEMA from '@database/drizzle.schema';
import { DrizzlePGModule } from '@knaadh/nestjs-drizzle-pg';
import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { AppController } from './app.controller';
import { PG_MIGRATIONS_PATH, PG_PROVIDER } from './app.definition';
import { AppService } from './app.service';
import { FileModule } from './files/file.module';

@Module({
  imports: [
    ConfigModule,
    FileModule,
    DrizzlePGModule.registerAsync({
      tag: PG_PROVIDER,
      inject: [ConfigService],
      useFactory: ({ database }: ConfigService) => {
        return {
          pg: {
            connection: 'client',
            config: {
              host: database.host,
              port: database.port,
              user: database.user,
              password: database.password,
              database: database.database,
            },
          },
          config: {
            schema: {
              ...DRIZZLE_SCHEMA,
            },
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  private readonly logger = new Logger('AppModule');

  constructor(
    @InjectDrizzle()
    private readonly db: DrizzleDb,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Trying to migrate database...');
    await migrate(this.db, { migrationsFolder: PG_MIGRATIONS_PATH });
  }
}
