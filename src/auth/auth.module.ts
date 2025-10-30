import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { JwtRefreshStrategy } from "./strategies/jwt-refresh.strategy";
import { LocalStrategy } from "./strategies/local.strategy";
import { MailModule } from "src/mail/mail.module";
import { UsersModule } from "src/users/users.module";
import { TokenModule } from "src/token/token.module";
import { PassportModule } from "@nestjs/passport";

@Module({
    imports: [PassportModule, TokenModule, UsersModule, MailModule],
    providers: [AuthService, JwtStrategy, JwtRefreshStrategy, LocalStrategy],
    controllers: [AuthController],
})
export class AuthModule {}
