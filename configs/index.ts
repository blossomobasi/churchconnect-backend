/* eslint-disable @typescript-eslint/no-non-null-assertion */
import ms from "ms";
import { config } from "dotenv";
import packageInfo from "../package.json";

config();

// How to use this:
// ============================================================
// This file is used to store all the environment variables and constants used in the application.

// # To add a new variable:
// ============================================================
// - For environment variables & constants that are the same across all environments, add them to the GLOBAL_CONSTANTS object.
// - For environment-specific variables (i.e they change depending on the environment), add them to the environment's object in each of the CONFIG_BUILDER object.

// # To add a new environment:
// ============================================================
// 1. Add a new key to the CONFIG_BUILDER object with the environment name.
// 2. Duplicate the development object and replace the values with the new environment's values.

const APP_VERSION = packageInfo.version;
const DEPLOYMENT_ENV = process.env.NODE_ENV || "development";

const GLOBAL_CONSTANTS = {
    // System Constants
    // ============================================================
    APP_NAME: "ChurchConnect",
    APP_DESCRIPTION: "",
    SUPPORT_EMAIL: "support@contact.blossomobasi.xyz",
    DEFAULT_EMAIL_FROM: "ChurchConnect <no-reply@contact.blossomobasi.xyz>",

    PORT: process.env.PORT ? process.env.PORT : 4000,

    // Server Constants
    // ============================================================
    SERVER_BACKEND_TEAM_EMAILS: [], // TODO: Add alerts notification emails here

    // Security / Auth Configs
    // ============================================================
    BCRYPT_SALT: 10,
    JWT_ALGORITHM: "HS256",
    ACCESS_TOKEN_JWT_EXPIRES_IN: ms("1h"),
    REFRESH_TOKEN_JWT_EXPIRES_IN: ms("30d"),
    ROTATE_REFRESH_TOKENS: true,

    // Sentry & Monitoring Configs
    // ============================================================
    SENTRY: {
        RELEASE: APP_VERSION,
        DSN: "https://examplePublicKey@o0.ingest.sentry.io/0",
    },

    // App Level Configs
    // ============================================================

    AWS: {
        S3_BUCKET: process.env.AWS_S3_BUCKET_NAME,
        ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_REGION,

        AWS_CLOUDFRONT_KEY_PAIR_ID: process.env.AWS_CLOUDFRONT_KEY_PAIR_ID,
        AWS_CLOUDFRONT_PRIVATE_KEY: process.env.AWS_CLOUDFRONT_PRIVATE_KEY ? process.env.AWS_CLOUDFRONT_PRIVATE_KEY.replace(/\\n/g, "\n") : undefined,
        AWS_CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME: process.env.AWS_CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME,
    },

    USE_EMAIL_QUEUE: process.env.USE_EMAIL_QUEUE === "true" ? true : false,
};

const CONFIG_BUILDER = {
    development: {
        ...GLOBAL_CONSTANTS,

        HOST: "127.0.0.1",

        // System Constants
        // ============================================================
        URLS: {
            API_BASE_URL: "http://localhost:4000",
            FRONTEND_BASE_URL: "http://localhost:3000",
        },

        // Security / Auth Configs
        // ============================================================
        JWT_SECRET: process.env.JWT_SECRET,

        // DB Constants
        // ============================================================
        REDIS_URI: process.env.REDIS_URI,

        // Mailer Configs
        // ============================================================
        MAILER: {
            SMTP_HOST: process.env.MAILER_SMTP_HOST,
            SMTP_PORT: process.env.MAILER_SMTP_PORT,
            SMTP_USER: process.env.MAILER_SMTP_USER,
            SMTP_PASSWORD: process.env.MAILER_SMTP_PASSWORD,
            SECURE: process.env.MAILER_SECURE === "true" ? true : false,
            USE_AWS_SES: process.env.MAILER_USE_AWS_SES === "true" ? true : false,
            USE_GMAIL_SMTP: process.env.MAILER_USE_GMAIL_SMTP === "true" ? true : false,
            FROM_EMAIL: "ChurchConnect <no-reply@contact.blossomobasi.xyz>",
            RESEND_API_KEY: process.env.RESEND_API_KEY,
        },

        // App Level Configs
        // ============================================================
        // CORS_ALLOWED_ORIGINS: ["*"],
        CORS_ALLOWED_ORIGINS: ["http://localhost:3000", "http://localhost:3001", "http://localhost3002"],

        SWAGGER: {
            PATH: "/docs",
            PASSWORD: "password",
        },

        PAYSTACK: {
            BASE_URL: process.env.PAYSTACK_BASE_URL,
            SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
            CALLBACK_URL: process.env.PAYSTACK_CALLBACK_URL,
        },

        SUPPORT: {
            URL: "",
        },
    },

    production: {
        ...GLOBAL_CONSTANTS,

        HOST: process.env.HOST || "0.0.0.0",

        // System Constants
        // ============================================================
        URLS: {
            API_BASE_URL: "https://api.churchconnect.com",
            FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL,
        },

        // SecurityFRONTEND_URL / Auth Configs
        // ============================================================
        JWT_SECRET: process.env.JWT_SECRET!,

        // DB Constants
        // ============================================================
        REDIS_URI: process.env.REDIS_URI!,

        // Mailer Configs
        // ============================================================

        MAILER: {
            SMTP_HOST: process.env.MAILER_SMTP_HOST,
            SMTP_PORT: process.env.MAILER_SMTP_PORT,
            SMTP_USER: process.env.MAILER_SMTP_USER,
            SMTP_PASSWORD: process.env.MAILER_SMTP_PASSWORD,
            SECURE: process.env.MAILER_SECURE === "true" ? true : false,
            USE_AWS_SES: process.env.MAILER_USE_AWS_SES === "true" ? true : false,
            USE_GMAIL_SMTP: process.env.MAILER_USE_GMAIL_SMTP === "true" ? true : false,
            FROM_EMAIL: "Churchconnect <no-reply@contact.blossomobasi.xyz>",
        },

        // App Level Configs
        // ============================================================

        CORS_ALLOWED_ORIGINS: Array.from(new Set(["https://admin.socket.io", "https://example.com", "http://localhost:3000", "http://localhost:3001"].concat(process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(",") : []))),

        SWAGGER: {
            PATH: "/docs",
            PASSWORD: process.env.SWAGGER_PASSWORD!,
        },
        PAYSTACK: {
            BASE_URL: process.env.PAYSTACK_BASE_URL || "https://api.paystack.co",
            SECRET_KEY: process.env.PAYSTACK_SECRET_KEY!,
            CALLBACK_URL: process.env.PAYSTACK_CALLBACK_URL!,
        },

        SUPPORT: {
            URL: "",
        },
    },
} as const;

// Check if DEPLOYMENT_ENV is valid
if (!Object.keys(CONFIG_BUILDER).includes(DEPLOYMENT_ENV)) {
    throw new Error(`Invalid NODE_ENV: ${DEPLOYMENT_ENV}`);
}

const CONFIGS = CONFIG_BUILDER[DEPLOYMENT_ENV as keyof typeof CONFIG_BUILDER];

// Uncomment below to check configs set
// console.log("CONFIGS:", CONFIGS);

export { DEPLOYMENT_ENV, APP_VERSION, CONFIGS };

export default () => ({ DEPLOYMENT_ENV, APP_VERSION, CONFIGS });
