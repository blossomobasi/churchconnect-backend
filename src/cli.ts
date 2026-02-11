#!/usr/bin/env node

import { NestFactory } from "@nestjs/core";
import { CommandService } from "nestjs-command";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ["log", "error", "warn"],
    });

    try {
        await app.get(CommandService).exec();
        await app.close();
        process.exit(0);
    } catch (error) {
        console.error(error);
        await app.close();
        process.exit(1);
    }
}

bootstrap();
