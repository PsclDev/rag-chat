import { ConfigService } from '@config';
import { DrizzleDb, InjectDrizzle } from '@database';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { File, FileEntity } from './schema/file.schema';

@Injectable()
export class FileService {
  private readonly logger = new Logger('FileService');

  constructor(
    private readonly config: ConfigService,
    @InjectDrizzle()
    private readonly db: DrizzleDb,
  ) {}

  async getFiles(): Promise<FileEntity[]> {
    return await this.db.select().from(File);
  }

  async getFile(id: string): Promise<FileEntity> {
    const file = await this.db.select().from(File).where(eq(File.id, id));
    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file[0];
  }

  async deleteFile(id: string): Promise<void> {
    await this.db.delete(File).where(eq(File.id, id));
  }
}
