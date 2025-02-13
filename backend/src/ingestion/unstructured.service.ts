import * as fs from 'fs';

import { ConfigService } from '@config';
import { FileEntity } from '@database';
import { Injectable, Logger } from '@nestjs/common';
import { UnstructuredClient } from 'unstructured-client';
import { PartitionResponse } from 'unstructured-client/sdk/models/operations';
import {
  ChunkingStrategy,
  Strategy,
} from 'unstructured-client/sdk/models/shared';

@Injectable()
export class UnstructuredService {
  private readonly logger: Logger = new Logger('Unstructured Service');
  private readonly unstructured: UnstructuredClient;

  constructor(private readonly config: ConfigService) {
    this.unstructured = new UnstructuredClient({
      serverURL: this.config.ingestion.unstructured.serverURL,
      security: {
        apiKeyAuth: this.config.ingestion.unstructured.apiKey,
      },
    });
  }

  private printProcessingTime(startTime: number, filename: string): void {
    const duration = Date.now() - startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(0);
    this.logger.log(
      `${filename} taken ${minutes
        .toString()
        .padStart(2, '0')}:${seconds.padStart(2, '0')}min`,
    );
  }

  async partition(file: FileEntity): Promise<PartitionResponse> {
    try {
      const startTime = Date.now();
      this.logger.log(`Starting partition for file: ${file.originalname}`);
      const fileData = fs.readFileSync(file.path);
      this.logger.log(`file data found? ${fileData !== undefined}`);
      const response = await this.unstructured.general.partition({
        partitionParameters: {
          files: {
            content: fileData,
            fileName: file.originalname,
          },
          chunkingStrategy: ChunkingStrategy.ByTitle,
          strategy: Strategy.HiRes,
          splitPdfPage: true,
          splitPdfConcurrencyLevel: 15,
          maxCharacters: 100000,
          combineUnderNChars: 3500,
          newAfterNChars: 3500,
          extractImageBlockTypes: ['Image', 'Table'],
        },
      });
      this.printProcessingTime(startTime, file.originalname);

      const { elements, ...rest } = response;

      this.logger.log('Response', {
        ...rest,
        elementsCount: elements.length,
      });

      return response;
    } catch (error) {
      this.logger.error(
        `Error partitioning file ${file.originalname}: ${error.message}`,
      );
    }
  }
}
