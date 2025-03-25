import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DrizzleDb, InjectDrizzle } from '@database';

import { File, FileEntity } from './schema/file.schema';

@Injectable()
export class FileService {
  private readonly logger = new Logger('FileService');

  constructor(
    @InjectDrizzle()
    private readonly db: DrizzleDb,
  ) {}

  async getFile(id: string): Promise<FileEntity> {
    const file = await this.db.query.File.findFirst({
      where: eq(File.id, id),
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }
}
