import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppService {
    constructor(private readonly configService: ConfigService) {}

    getHello(): string {
        return `Welcome to ${this.configService.get<string>("CONFIGS.APP_NAME")} API!`;
    }
}
