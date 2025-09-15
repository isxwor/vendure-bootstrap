import { generateMigration, revertLastMigration, runMigrations } from '@vendure/core';
import { Command } from 'commander';
import { config } from './src/vendure-config';

const program = new Command();

program
    .command('generate <name>')
    .description('Generate a new migration file with the given name')
    .action(async (name: string) => {
        try {
            await generateMigration(config, { name, outputDir: './src/migrations' });
            console.log('Migration generated successfully.');
        } catch (error) {
            console.error('Error generating migration:', error);
            process.exit(1);
        }
    });

program
    .command('run')
    .description('Run all pending migrations')
    .action(async () => {
        try {
            await runMigrations(config);
            console.log('Migrations executed successfully.');
        } catch (error) {
            console.error('Error running migrations:', error);
            process.exit(1);
        }
    });

program
    .command('revert')
    .description('Revert the last applied migration')
    .action(async () => {
        try {
            await revertLastMigration(config);
            console.log('Last migration reverted.');
        } catch (error) {
            console.error('Error reverting migration:', error);
            process.exit(1);
        }
    });

program.parse(process.argv);
