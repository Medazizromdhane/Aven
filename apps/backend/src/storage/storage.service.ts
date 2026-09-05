import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client | null;
  private readonly bucket = process.env.STORAGE_BUCKET ?? process.env.R2_BUCKET ?? 'visahunter';
  private readonly localDir = join(process.cwd(), 'uploads');

  constructor() {
    const legacyAccountId = process.env.R2_ACCOUNT_ID;
    const endpoint =
      process.env.STORAGE_ENDPOINT ??
      (legacyAccountId ? `https://${legacyAccountId}.r2.cloudflarestorage.com` : undefined);
    const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID ?? process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY ?? process.env.R2_SECRET_ACCESS_KEY;

    if (endpoint && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region: process.env.STORAGE_REGION ?? 'auto',
        endpoint,
        forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === 'true',
        credentials: { accessKeyId, secretAccessKey },
      });
      return;
    }

    this.client = null;
    this.logger.warn('Persistent object storage is not configured. Local storage is development-only.');
  }

  async upload(buffer: Buffer, contentType: string, keyPrefix = 'files'): Promise<string> {
    const key = `${keyPrefix}/${randomUUID()}${this.extFor(contentType)}`;

    if (this.client) {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }),
      );
      return key;
    }

    this.ensureLocalStorageIsAllowed();
    const fullPath = this.localPath(key);
    await fs.mkdir(join(fullPath, '..'), { recursive: true });
    await fs.writeFile(fullPath, buffer);
    return key;
  }

  async download(key: string): Promise<Buffer> {
    const normalizedKey = this.normalizeKey(key);

    if (this.client) {
      const result = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: normalizedKey }),
      );
      if (!result.Body) {
        throw new ServiceUnavailableException('Stored file is unavailable');
      }
      return Buffer.from(await result.Body.transformToByteArray());
    }

    this.ensureLocalStorageIsAllowed();
    return fs.readFile(this.localPath(normalizedKey));
  }

  async remove(key: string): Promise<void> {
    const normalizedKey = this.normalizeKey(key);

    if (this.client) {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: normalizedKey }),
      );
      return;
    }

    this.ensureLocalStorageIsAllowed();
    await fs.rm(this.localPath(normalizedKey), { force: true });
  }

  private ensureLocalStorageIsAllowed() {
    if (process.env.NODE_ENV === 'production') {
      throw new ServiceUnavailableException(
        'Persistent object storage must be configured before handling files in production',
      );
    }
  }

  private normalizeKey(key: string): string {
    const normalized = key.replace(/\\/g, '/').replace(/^\/+/, '');
    if (!normalized || normalized.split('/').includes('..')) {
      throw new ServiceUnavailableException('Invalid stored file reference');
    }
    return normalized;
  }

  private localPath(key: string): string {
    return join(this.localDir, key);
  }

  private extFor(contentType: string): string {
    switch (contentType) {
      case 'application/pdf':
        return '.pdf';
      case 'image/png':
        return '.png';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '.docx';
      default:
        return '';
    }
  }
}
