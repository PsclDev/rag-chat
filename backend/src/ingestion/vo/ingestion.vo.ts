import { Strategy } from 'unstructured-client/sdk/models/shared';

import { FileEntity, FileQueueEntity } from '@database';

export interface IngestionOptionsVo {
  chunkingStrategy: 'by_title';
  strategy: Strategy;
  splitPdfPage?: boolean;
  splitPdfConcurrencyLevel?: number;
  maxCharacters?: number;
  combineUnderNChars?: number;
  newAfterNChars?: number;
  extractImageBlockTypes?: string[];
}

export interface FileIngestionVo {
  file: FileEntity;
  queue: FileQueueEntity;
}
