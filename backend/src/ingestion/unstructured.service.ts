import * as fs from 'fs';

import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

import { ConfigService } from '@config';
import { FileEntity } from '@database';

import {
  getIngestionOptions,
  IngestionOptionsVo,
  UnstructuredPartitionResponse,
} from './vo/ingestion.vo';

@Injectable()
export class UnstructuredService {
  private readonly logger: Logger = new Logger('Unstructured Service');

  constructor(private readonly config: ConfigService) {}

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

  async partition(
    file: FileEntity,
    options: IngestionOptionsVo,
    abortSignal: AbortSignal,
  ): Promise<UnstructuredPartitionResponse[]> {
    try {
      const startTime = Date.now();
      this.logger.debug(`Starting partition for file: ${file.originalname}`);
      const fileData = fs.readFileSync(file.path);
      this.logger.debug(`file data found? ${fileData !== undefined}`);

      const formdata = new FormData();
      formdata.append('files', new Blob([fileData]), file.originalname);
      for (const [key, value] of Object.entries(getIngestionOptions(options))) {
        const valArr = Array.isArray(value) ? value : [value];
        valArr.forEach((val) => formdata.append(key, String(val)));
      }

      const { data } = await axios.post<UnstructuredPartitionResponse[]>(
        `${this.config.ingestion.unstructured.serverURL}/general/v0/general`,
        formdata,
        {
          headers: {
            Accept: 'application/json',
            'unstructured-api-key': this.config.ingestion.unstructured.apiKey,
          },
          signal: abortSignal,
        },
      );

      this.printProcessingTime(startTime, file.originalname);

      this.logger.log('Response', {
        elementsCount: data.length,
      });

      return data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error partitioning file ${file.originalname}: ${errorMessage}`,
      );
      throw error;
    }
  }
}
