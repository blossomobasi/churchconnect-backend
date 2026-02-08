import chalk from "chalk";
import bcryptjs from "bcryptjs";
import inquirer from "inquirer";
import { Command } from "nestjs-command";
import { isEmail } from "class-validator";
import { ConfigService } from "@nestjs/config";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Role } from "@prisma/client";

@Injectable()
export class UserCommand {
    private readonly logger = new Logger(UserCommand.name);

    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService
    ) {}

    @Command({
        command: "create:super-admin",
        describe: "Create a super admin user",
    })
    async createSuperAdmin(): Promise<void> {
        console.log(chalk.blue.bold("\n=== CREATE SUPER ADMIN ===\n"));

        const { firstName } = await inquirer.prompt({
            type: "input",
            name: "firstName",
            message: "First name:",
        });

        const { lastName } = await inquirer.prompt({
            type: "input",
            name: "lastName",
            message: "Last name:",
        });

        const { email } = await inquirer.prompt({
            type: "input",
            name: "email",
            message: "Email:",
        });

        if (!isEmail(email)) {
            this.logger.error("Invalid email address");
            return;
        }

        const { password } = await inquirer.prompt({
            type: "password",
            name: "password",
            message: "Password:",
            mask: "*",
        });

        const { confirmPassword } = await inquirer.prompt({
            type: "password",
            name: "confirmPassword",
            message: "Confirm password:",
            mask: "*",
        });

        if (password !== confirmPassword) {
            this.logger.error("Passwords do not match");
            return;
        }

        const existingUser = await this.prismaService.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            this.logger.error("User with this email already exists");
            return;
        }

        const saltRounds = this.configService.get<number>("CONFIGS.BCRYPT_SALT") ?? 10;

        const passwordHash = await bcryptjs.hash(password, saltRounds);

        const user = await this.prismaService.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: passwordHash,
                role: Role.ADMIN,
                emailVerified: true,
                isActive: true,
            },
        });

        this.logger.log(chalk.green(`✔ Super admin created successfully: ${user.email}`));
    }
}
