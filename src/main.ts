import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import basicAuth from "express-basic-auth";
import { ConfigService } from "@nestjs/config";
import { APP_VERSION, CONFIGS } from "configs";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { AllExceptionFilter } from "./common/filters/all-exception.filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);

    app.use([configService.get("CONFIGS.SWAGGER.PATH"), `${configService.get("CONFIGS.SWAGGER.PATH")}-json`, `${configService.get("CONFIGS.SWAGGER.PATH")}-yaml`], basicAuth({ challenge: true, users: { admin: configService.get("CONFIGS.SWAGGER.PASSWORD") as string } }));

    app.enableCors({
        credentials: true,
        origin: [...CONFIGS.CORS_ALLOWED_ORIGINS],
    });
    app.enableVersioning({ type: VersioningType.URI });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new AllExceptionFilter());

    const swaggerConfig = new DocumentBuilder().setTitle(CONFIGS.APP_NAME).setDescription(CONFIGS.APP_DESCRIPTION).setVersion(APP_VERSION).setExternalDoc("View in YAML", `${CONFIGS.SWAGGER.PATH}-yaml`).addBearerAuth().build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(CONFIGS.SWAGGER.PATH, app, swaggerDocument, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });

    const PORT = configService.get("CONFIGS.PORT");
    const HOST = configService.get("CONFIGS.HOST");

    await app.listen(PORT, HOST, () => {
        console.log(`Server is running on http://${HOST}:${PORT}`);
    });
}
bootstrap();
