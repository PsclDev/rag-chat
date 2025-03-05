import { FileEntity, FileQueueEntity } from '@database';
import {
  ChunkingStrategy,
  Strategy,
} from 'unstructured-client/sdk/models/shared';

export interface IngestionOptionsVo {
  chunkingStrategy: ChunkingStrategy;
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
