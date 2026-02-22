import { INestApplicationContext } from '@nestjs/common';
import { bootstrapWorker, ChannelService, CurrencyCode, DefaultJobQueuePlugin } from '@vendure/core';
import { populate } from '@vendure/core/cli';
import path from 'path';
import { config } from '../src/vendure-config';
import { initialData } from './data/initial-data';
import { getSuperadminContext } from './utils';

const populateConfig = {
    ...config,
    plugins: (config.plugins || []).filter(plugin => plugin !== DefaultJobQueuePlugin),
};

if (require.main === module) {
    (async () => {
        // await clearAllTables(populateConfig, true);
        // process.exit(0);

        try {
            await populateServer();
            console.log(`[${new Date().toISOString()}] Vendure server populated successfully.`);
            process.exit(0);
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Error during server population:`, error);
            process.exit(1);
        }
    })();
}

async function populateServer() {
    // Configure the app with asset import settings
    const populateConfigWithAssets = {
        ...populateConfig,
        importExportOptions: {
            importAssetsDir: path.join(__dirname, './data/assets'),
        },
    };

    const { app } = await bootstrapWorker(populateConfigWithAssets);
    console.log(`[${new Date().toISOString()}] Populating Vendure server with initial data...`);

    await populate(() => Promise.resolve(app), initialData, path.join(__dirname, './data/products.csv'));
    await setupDefaultCurrency(app);

    console.log(`[${new Date().toISOString()}] Initial data with products populated successfully.`);
}

async function setupDefaultCurrency(app: INestApplicationContext) {
    const ctx = await getSuperadminContext(app);
    const channelService = app.get(ChannelService);

    const channel = await channelService.getDefaultChannel(ctx);
    await channelService.update(ctx, {
        id: channel.id,
        availableCurrencyCodes: [CurrencyCode.NPR, CurrencyCode.USD],
        defaultCurrencyCode: CurrencyCode.NPR,
    });
}
