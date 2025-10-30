import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { UsersService } from "src/users/users.service";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
    constructor(
        configService: ConfigService,
        private readonly usersService: UsersService
    ) {
        super({
            ignoreExpiration: false,
            secretOrKey: configService.get("CONFIGS.JWT_SECRET") as string,
            jwtFromRequest: ExtractJwt.fromBodyField("refreshToken"),
        });
    }

    async validate(payload: any) {
        const user = await this.usersService.getById(payload.sub);
        return user;
    }
}
