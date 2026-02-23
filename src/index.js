import express from 'express';
import http from 'http';
import 'reflect-metadata';
import AppDataSource from './db/data-source.js';
import { matchRouter } from './routes/matches.js';
import { attachWebSocketServer } from './ws/server.js';

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the Express server!');
});

app.use('/matches', matchRouter);

const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

AppDataSource.initialize()
    .then(() => {
        console.log('Database connected via TypeORM');

        server.listen(PORT, HOST, () => {
            const baseURL =
                HOST === '0.0.0.0'
                    ? `http://localhost:${PORT}`
                    : `http://${HOST}:${PORT}`;
            console.log(`Server is running on ${baseURL}`);
            console.log(
                `WebSocket is running on ${baseURL.replace('http', 'ws')}/ws`,
            );
        });
    })
    .catch((error) => {
        console.error('Database connection error: ', error);
        process.exit(1);
    });
