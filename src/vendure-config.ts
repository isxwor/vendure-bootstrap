import 'dotenv/config';
import path from 'path';

import {
    dummyPaymentHandler,
    DefaultJobQueuePlugin,
    DefaultSchedulerPlugin,
    DefaultSearchPlugin,
    VendureConfig,
    DefaultAssetNamingStrategy,
    cleanSessionsTask,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin, FileBasedTemplateLoader } from '@vendure/email-plugin';
import { AssetServerPlugin, configureS3AssetStorage } from '@vendure/asset-server-plugin';
import { GraphiqlPlugin } from '@vendure/graphiql-plugin';
import { DashboardPlugin } from '@vendure/dashboard/plugin';
import { BrandingPlugin } from './plugins/branding/branding.plugin';

const IS_DEV = process.env.APP_ENV === 'dev';
const IS_EMAIL_DEV = process.env.EMAIL_ENV === 'dev';
const serverPort = +String(process.env.PORT) || 3000;

export const config: VendureConfig = {
    apiOptions: {
        port: serverPort,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        trustProxy: IS_DEV ? false : 1,
        // The following options are useful in development mode,
        // but are best turned off for production for security
        // reasons.
        ...(IS_DEV
            ? {
                  adminApiDebug: true,
                  shopApiDebug: true,
              }
            : {}),
    },
    authOptions: {
        tokenMethod: ['bearer', 'cookie'],
        superadminCredentials: {
            identifier: String(process.env.SUPERADMIN_USERNAME),
            password: String(process.env.SUPERADMIN_PASSWORD),
        },
        cookieOptions: {
            secret: process.env.COOKIE_SECRET,
        },
    },
    dbConnectionOptions: {
        type: 'postgres',
        // See the README.md "Migrations" section for an explanation of
        // the `synchronize` and `migrations` options.
        synchronize: false,
        migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
        logging: false,
        database: process.env.DB_NAME,
        schema: process.env.DB_SCHEMA,
        host: process.env.DB_HOST,
        port: +String(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
    },
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    schedulerOptions: {
        tasks: [cleanSessionsTask],
    },
    plugins: [
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, '../static/assets'),
            namingStrategy: new DefaultAssetNamingStrategy(),
            ...(IS_DEV
                ? {}
                : {
                      storageStrategyFactory: configureS3AssetStorage({
                          bucket: process.env.S3_BUCKET!,
                          credentials: {
                              accessKeyId: String(process.env.S3_ACCESS_KEY_ID),
                              secretAccessKey: String(process.env.S3_SECRET_ACCESS_KEY),
                          },
                          nativeS3Configuration: {
                              endpoint: String(process.env.S3_ENDPOINT),
                              s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE,
                              region: process.env.S3_REGION!,
                          },
                      }),
                  }),
            // For local dev, the correct value for assetUrlPrefix should
            // be guessed correctly, but for production it will usually need
            // to be set manually to match your production url.
            assetUrlPrefix: IS_DEV ? undefined : process.env.ASSET_URL_PREFIX,
        }),
        DashboardPlugin.init({
            route: 'dashboard',
            appDir: IS_DEV ? path.join(__dirname, '../dist/dashboard') : path.join(__dirname, 'dashboard'),
        }),
        DefaultSchedulerPlugin.init(),
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
        EmailPlugin.init({
            ...(IS_EMAIL_DEV
                ? {
                      devMode: true,
                      outputPath: path.join(__dirname, '../static/email/test-emails'),
                      route: 'mailbox',
                  }
                : {
                      transport: {
                          type: 'smtp',
                          host: process.env.SMTP_HOST,
                          port: Number(process.env.SMTP_PORT),
                          secure: false,
                          // tls: true,
                          auth: {
                              user: process.env.SMTP_USER,
                              pass: process.env.SMTP_PASS,
                          },
                      },
                  }),
            handlers: defaultEmailHandlers,
            templateLoader: new FileBasedTemplateLoader(path.join(__dirname, '../static/email/templates')),
            globalTemplateVars: {
                fromAddress: process.env.SMTP_FROM_EMAIL,
                verifyEmailAddressUrl: process.env.VERIFY_EMAIL_URL,
                passwordResetUrl: process.env.PASSWORD_RESET_URL,
                changeEmailAddressUrl: process.env.CHANGE_EMAIL_URL,
            },
        }),
        GraphiqlPlugin.init(),
        //
        BrandingPlugin,
    ],
};
