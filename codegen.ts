import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    // This assumes your server is running on the standard port
    // and with the default admin API path. Adjust accordingly.
    config: {
        maybeValue: 'T',
        // This tells codegen that the `Money` scalar is a number
        scalars: { ID: 'string | number', Money: 'number' },
        // This ensures generated enums do not conflict with the built-in types.
        namingConvention: { enumValues: 'keep' },
    },
    generates: {
        'src/codegen/shopTypes.ts': {
            schema: 'http://localhost:3000/shop-api',
            plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
        },
        'src/codegen/adminTypes.ts': {
            schema: 'http://localhost:3000/admin-api',
            plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
        },
    },
};

export default config;
