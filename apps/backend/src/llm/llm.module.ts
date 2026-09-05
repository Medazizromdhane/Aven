import { Global, Module } from '@nestjs/common';
import { MistralService } from './mistral.service';

@Global()
@Module({
  providers: [MistralService],
  exports: [MistralService],
})
export class LlmModule {}
