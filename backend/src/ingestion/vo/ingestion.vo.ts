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

export interface UnstructuredPartitionResponse {
  type: string;
  element_id: string;
  text: string;
  metadata: {
    filetype: string;
    languages: string[];
    page_number: number;
    orig_elements: string;
    filename: string;
  };
}

export function getIngestionOptions(options: IngestionOptionsVo): object {
  return {
    chunking_strategy: 'by_title',
    strategy: options.strategy,
    split_pdf_page: options.splitPdfPage ?? false,
    split_pdf_concurrency_level: options.splitPdfConcurrencyLevel ?? 15,
    max_characters: options.maxCharacters ?? 100000,
    combine_under_n_chars: options.combineUnderNChars ?? 3500,
    new_after_n_chars: options.newAfterNChars ?? 3500,
    extract_image_block_types: options.extractImageBlockTypes ?? [
      'Image',
      'Table',
    ],
  };
}

export interface FileIngestionVo {
  file: FileEntity;
  queue: FileQueueEntity;
}
