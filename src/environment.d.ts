export {};

// Here we declare the members of the process.env object, so that we
// can use them in our application code in a type-safe manner.
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            APP_ENV: string;

            PORT: string;

            COOKIE_SECRET: string;
            SUPERADMIN_USERNAME: string;
            SUPERADMIN_PASSWORD: string;

            DB_HOST: string;
            DB_PORT: number;
            DB_NAME: string;
            DB_USERNAME: string;
            DB_PASSWORD: string;
            DB_SCHEMA: string;

            ASSET_URL_PREFIX: string;

            S3_BUCKET: string;
            S3_ACCESS_KEY_ID: string;
            S3_SECRET_ACCESS_KEY: string;
            S3_ENDPOINT: string;
            S3_FORCE_PATH_STYLE: boolean;
            S3_REGION: string;

            SMTP_HOST: string;
            SMTP_USER: string;
            SMTP_PASS: string;
            SMTP_PORT: string;
            SMTP_FROM_EMAIL: string;

            VERIFY_EMAIL_URL: string;
            PASSWORD_RESET_URL: string;
            CHANGE_EMAIL_URL: string;
        }
    }
}
