import { Provider } from '@nestjs/common';
import { GreenhouseProvider } from './providers/greenhouse.provider';
import { LeverProvider } from './providers/lever.provider';
import { RemotiveProvider } from './providers/remotive.provider';
import { TheMuseProvider } from './providers/themuse.provider';
import { AdzunaProvider } from './providers/adzuna.provider';
import { JSearchProvider } from './providers/jsearch.provider';
import { JobProvider } from './providers/provider.interface';

/** Injection token for the aggregated list of job providers. */
export const JOB_PROVIDERS = Symbol('JOB_PROVIDERS');

export const jobProvidersProvider: Provider = {
  provide: JOB_PROVIDERS,
  useFactory: (...providers: JobProvider[]): JobProvider[] => providers,
  inject: [
    GreenhouseProvider,
    LeverProvider,
    RemotiveProvider,
    TheMuseProvider,
    AdzunaProvider,
    JSearchProvider,
  ],
};
