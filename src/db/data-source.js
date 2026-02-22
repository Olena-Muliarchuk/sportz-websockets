import 'reflect-metadata';
import { DataSource } from 'typeorm';
import 'dotenv/config';
import { AppEntities } from './schemas/index.js';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in .env');
}

const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: true, // Mandatory for Neon
    synchronize: false,
    logging: false,
    entities: AppEntities,
    migrations: ['src/db/migrations/*.cjs'],
    subscribers: [],
});

export default AppDataSource;