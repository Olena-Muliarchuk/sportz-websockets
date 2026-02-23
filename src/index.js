import express from 'express';
import "reflect-metadata";
import AppDataSource from "./db/data-source.js";
import { matchRouter } from './routes/matches.js';

AppDataSource.initialize()
    .then(() => console.log("Database connected via TypeORM"))
    .catch((error) => console.log("Database connection error: ", error));

const app = express();
const PORT = 8000;

// JSON Middleware to parse incoming requests
app.use(express.json());

// Root GET route
app.get('/', (req, res) => {
    res.send('Welcome to the Express server!');
});

app.use('/matches', matchRouter);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
