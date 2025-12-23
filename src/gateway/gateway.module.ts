import { Module } from '@nestjs/common';
import { BoothGateway } from './booth.gateway';

@Module({
    providers: [BoothGateway],
    exports: [BoothGateway],
})
export class GatewayModule { }
