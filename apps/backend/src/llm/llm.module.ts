import { Global, Module } from '@nestjs/common';
import { GroqService } from './mistral.service';

@Global()
@Module({
  providers: [GroqService],
  exports: [GroqService],
})
export class LlmModule {}
