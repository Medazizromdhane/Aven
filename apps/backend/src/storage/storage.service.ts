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
    const configuredEndpoint =
      process.env.STORAGE_ENDPOINT ??
      (legacyAccountId ? `https://${legacyAccountId}.r2.cloudflarestorage.com` : undefined);
    const endpoint = this.normalizeEndpoint(configuredEndpoint);
    const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID ?? process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY ?? process.env.R2_SECRET_ACCESS_KEY;

    if (endpoint && accessKeyId && secretAccessKey) {
      // Supabase (and most S3-compatible providers exposing a custom endpoint) require
      // path-style addressing; virtual-hosted style would prepend the bucket to the host.
      const isSupabase = /\.supabase\.(co|com)/.test(endpoint);
      const forcePathStyle =
        process.env.STORAGE_FORCE_PATH_STYLE === 'true' ||
        (process.env.STORAGE_FORCE_PATH_STYLE !== 'false' && isSupabase);
      const region = process.env.STORAGE_REGION ?? 'auto';
      if (isSupabase && (!process.env.STORAGE_REGION || region === 'auto')) {
        // Supabase signs S3 requests against the project's real region. Using the
        // Cloudflare-R2 style "auto" region makes every request fail with
        // SignatureDoesNotMatch, so uploads (and CV saves) silently break.
        this.logger.warn(
          'STORAGE_REGION is "auto" but the endpoint is Supabase. Set STORAGE_REGION to your ' +
            'project region shown under Storage → S3 access (e.g. eu-central-1), or S3 uploads will fail.',
        );
      }
      this.client = new S3Client({
        region,
        endpoint,
        forcePathStyle,
        credentials: { accessKeyId, secretAccessKey },
      });
      return;
    }

    this.client = null;
    this.logger.warn('Persistent object storage is not configured. Local storage is development-only.');
  }

  private normalizeEndpoint(endpoint?: string): string | undefined {
    if (!endpoint) return undefined;
    let normalized = endpoint.replace(/\/+$/, '');
    try {
      const url = new URL(normalized);
      const labels = url.hostname.split('.');
      // Some Supabase dashboards show a bucket-prefixed host by mistake,
      // such as bucket.project-ref.supabase.co. The S3 endpoint uses only the project ref.
      if (labels.length === 4 && labels[2] === 'supabase' && (labels[3] === 'co' || labels[3] === 'com')) {
        url.hostname = labels.slice(1).join('.');
        normalized = url.toString().replace(/\/+$/, '');
      }
    } catch {
      this.logger.warn('STORAGE_ENDPOINT is not a valid URL');
    }
    // Supabase project URLs need the S3-compatible storage path appended.
    if (/\.supabase\.(co|com)/.test(normalized) && !normalized.includes('/storage/v1/s3')) {
      return `${normalized}/storage/v1/s3`;
    }
    return normalized;
  }

  async upload(buffer: Buffer, contentType: string, keyPrefix = 'files'): Promise<string> {
    const key = `${keyPrefix}/${randomUUID()}${this.extFor(contentType)}`;

    if (this.client) {
      try {
        await this.client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
          }),
        );
      } catch (err) {
        const e = err as { name?: string; message?: string; $metadata?: { httpStatusCode?: number } };
        this.logger.error(
          `Storage upload failed (bucket="${this.bucket}", key="${key}", ` +
            `status=${e.$metadata?.httpStatusCode}, code=${e.name}): ${e.message}`,
        );
        throw new ServiceUnavailableException('Failed to store the uploaded file');
      }
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
