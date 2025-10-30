import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { CONFIGS } from "configs";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { AllExceptionFilter } from "./common/filters/all-exception.filter";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);

    app.enableCors({
        credentials: true,
        origin: [...CONFIGS.CORS_ALLOWED_ORIGINS],
    });
    app.enableVersioning({ type: VersioningType.URI });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new AllExceptionFilter());

    const PORT = configService.get("CONFIGS.PORT");
    const HOST = configService.get("CONFIGS.HOST");

    await app.listen(PORT, HOST, () => {
        console.log(`Server is running on http://${HOST}:${PORT}`);
    });
}
bootstrap();
