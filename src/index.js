import express from 'express';

const app = express();
const PORT = 8000;

// JSON Middleware to parse incoming requests
app.use(express.json());

// Root GET route
app.get('/', (short, res) => {
    res.send('Welcome to the Express server!');
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
