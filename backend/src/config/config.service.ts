import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ZodError, z } from 'zod';
import { fromZodError } from 'zod-validation-error';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenvExpand = require('dotenv-expand');
dotenvExpand.expand(dotenv.config());

const CONFIG_SCHEMA = z.object({
  nodeEnv: z.string(),
  isDevMode: z.boolean(),

  database: z.object({
    host: z.string().min(1),
    port: z.number(),
    user: z.string().min(1),
    password: z.string().min(1),
    database: z.string().min(1),
  }),
});

@Injectable()
export class ConfigService {
  private readonly logger = new Logger('ConfigService');

  // Config
  nodeEnv = process.env.NODE_ENV || 'production';
  isDevMode =
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'develop' ||
    process.env.NODE_ENV === 'dev';

  database = {
    host: process.env.APP_DB_HOST || '',
    port: Number(process.env.APP_DB_PORT) || 5432,
    user: process.env.APP_DB_USER || '',
    password: process.env.APP_DB_PASSWORD || '',
    database: process.env.APP_DB_NAME || 'deadrag',
  };

  // ===

  toBool(input: string | undefined): boolean {
    if (!input) return false;
    return [true, 'true', '1', 1, 'yes', 'y'].includes(input.toLowerCase());
  }

  printAppConfig() {
    // biome-ignore lint/suspicious/noExplicitAny: because non relevante instances, thats necessary
    const { logger, ...rest } = this as any;

    const safeConfig = this.hideSensitiveData(JSON.parse(JSON.stringify(rest)));
    this.logger.log(
      `App Configuration: \n${JSON.stringify(safeConfig, undefined, 2)}`,
    );
  }

  private hideSensitiveData(obj: object) {
    function isObject(value: unknown): boolean {
      return typeof value === 'object' && value !== null;
    }

    function shouldHideKey(key: string, hideAll: boolean): boolean {
      return (
        hideAll ||
        key === 'password' ||
        key === 'secret' ||
        key.toLowerCase().includes('key')
      );
    }

    function replace(obj: object, hideAll = false): void {
      for (const key of Object.keys(obj)) {
        if (isObject(obj[key])) {
          replace(obj[key], hideAll || key === 'encryptionKey');
        } else if (shouldHideKey(key, hideAll)) {
          obj[key] = '********';
        }
      }
    }

    replace(obj);
    return obj;
  }
}

function validateConfigSchema(
  schema: z.ZodObject<z.ZodRawShape, 'strip', z.ZodTypeAny>,
  obj: object,
) {
  try {
    schema.parse(obj);
  } catch (err) {
    const errors = fromZodError(err as ZodError)
      .toString()
      .replace(/;/g, '\n');

    const logger = new Logger('ConfigService');
    logger.error(`Config validation error\n${errors}`);
    process.exit(1);
  }
}

validateConfigSchema(CONFIG_SCHEMA, new ConfigService());
