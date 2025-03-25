/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as crypto from 'crypto';
import * as os from 'os';

import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ZodError, z } from 'zod';
import { fromZodError } from 'zod-validation-error';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
const dotenvExpand = require('dotenv-expand');
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
dotenvExpand.expand(dotenv.config());

const CONFIG_SCHEMA = z.object({
  nodeId: z.string().length(8),

  nodeEnv: z.string(),
  port: z.number(),
  isDevMode: z.boolean(),
  printConfig: z.boolean(),

  database: z.object({
    host: z.string().min(1),
    port: z.number(),
    user: z.string().min(1),
    password: z.string().min(1),
    database: z.string().min(1),
  }),

  fileStorage: z.object({
    path: z.string().min(1),
  }),

  ingestion: z.object({
    batchSize: z.number().optional(),
    voyageai: z.object({
      apiKey: z.string().min(1),
    }),
    unstructured: z.object({
      serverURL: z.string().min(1),
      apiKey: z.string().min(1),
    }),
  }),

  llm: z.object({
    embedding: z.object({
      adapter: z.enum(['voyage', 'sentence-transformer']),
    }),
    anthropic: z.object({
      apiKey: z.string().min(1),
    }),
  }),
});

@Injectable()
export class ConfigService {
  private readonly logger = new Logger('ConfigService');

  // Config
  nodeId = this.getNodeId();
  nodeEnv = process.env.NODE_ENV || 'production';
  port = Number(process.env.APP_PORT) || 3010;
  isDevMode =
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'develop' ||
    process.env.NODE_ENV === 'dev';
  printConfig = this.toBool(process.env.APP_PRINT_CONFIG);

  database = {
    host: process.env.APP_DB_HOST || '',
    port: Number(process.env.APP_DB_PORT) || 5432,
    user: process.env.APP_DB_USER || '',
    password: process.env.APP_DB_PASSWORD || '',
    database: process.env.APP_DB_NAME || 'deadrag',
  };

  fileStorage = {
    path: process.env.FILE_STORAGE_PATH || 'data/storage',
  };

  ingestion = {
    batchSize: Number(process.env.INGESTION_BATCH_SIZE) || 1,
    voyageai: {
      apiKey: process.env.VOYAGEAI_API_KEY || '',
    },
    unstructured: {
      serverURL: process.env.UNSTRUCTURED_SERVER_URL || '',
      apiKey: process.env.UNSTRUCTURED_API_KEY || '',
    },
  };

  llm = {
    embedding: {
      adapter: process.env.LLM_EMBEDDING_ADAPTER || 'voyage',
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    },
  };

  // ===

  private getNodeId(): string {
    return crypto
      .createHash('sha256')
      .update(os.hostname())
      .digest('hex')
      .slice(0, 8);
  }

  private toBool(input: string | undefined): boolean {
    if (!input) return false;
    return [true, 'true', '1', 1, 'yes', 'y'].includes(input.toLowerCase());
  }

  printAppConfig() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars
    const { logger, ...rest } = this as any;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
