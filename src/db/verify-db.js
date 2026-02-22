import { AppDataSource } from './data-source.js';

async function check() {
    try {
        await AppDataSource.initialize();
        const res = await AppDataSource.query('SELECT version()');
        console.log('Connected to Neon! Version:', res[0].version);
        await AppDataSource.destroy();
    } catch (err) {
        console.error('Connection failed:', err);
    }
}
check();
