import path from 'path';
import { vendureDashboardPlugin } from '@vendure/dashboard/vite';
import { pathToFileURL } from 'url';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const HOST = env.VENDURE_API_HOST;
    const PORT = Number(env.VENDURE_API_PORT);

    return {
        base: '/dashboard/',
        build: {
            outDir: path.join(__dirname, 'dist/dashboard'),
        },
        plugins: [
            vendureDashboardPlugin({
                vendureConfigPath: pathToFileURL('./src/vendure-config.ts'),
                api: {
                    host: HOST,
                    ...(PORT ? { port: PORT } : {}),
                },
                gqlOutputPath: path.resolve(__dirname, './src/gql/'),
            }),
        ],
        resolve: {
            alias: {
                '@/gql': path.resolve(__dirname, './src/gql/graphql.ts'),
            },
        },
    };
});
