import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

/**
 * Keeps the Render free web service awake.
 *
 * Render free instances spin down after ~15 minutes of inactivity, which adds a
 * cold-start delay of up to a minute on the next request. This service pings the
 * public health endpoint on an interval so the instance stays warm.
 *
 * Enabled automatically on Render (RENDER_EXTERNAL_URL is set) in production.
 * Override with KEEP_ALIVE_URL / KEEP_ALIVE_INTERVAL_MS, or disable with
 * KEEP_ALIVE_ENABLED=false.
 */
@Injectable()
export class KeepAliveService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KeepAliveService.name);
  private timer?: NodeJS.Timeout;

  onModuleInit() {
    if (process.env.KEEP_ALIVE_ENABLED === 'false') {
      return;
    }

    const baseUrl = process.env.KEEP_ALIVE_URL ?? process.env.RENDER_EXTERNAL_URL;
    if (!baseUrl) {
      // No public URL to ping (e.g. local development) — nothing to keep awake.
      return;
    }

    const url = `${baseUrl.replace(/\/+$/, '')}/api/health`;
    const interval = Number(process.env.KEEP_ALIVE_INTERVAL_MS ?? 10 * 60 * 1000);

    this.timer = setInterval(() => {
      void this.ping(url);
    }, interval);
    // Do not keep the event loop alive solely for the keep-alive timer.
    this.timer.unref?.();

    this.logger.log(`Keep-alive enabled: pinging ${url} every ${Math.round(interval / 1000)}s`);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private async ping(url: string) {
    try {
      const res = await fetch(url, { method: 'GET' });
      this.logger.debug(`Keep-alive ping ${res.status} at ${new Date().toISOString()}`);
    } catch (err) {
      this.logger.warn(`Keep-alive ping failed: ${(err as Error).message}`);
    }
  }
}
