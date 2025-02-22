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
