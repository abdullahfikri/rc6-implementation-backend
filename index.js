import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';

// Import routes
import userRoutes from './routes/users.js';
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use('/user', userRoutes);

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.DB_CONNECT)
    .then(() =>
        app.listen(PORT, () => console.log(`SERVER RUNNING AT PORT: ${PORT}`))
    )
    .catch((err) => console.log(err.message));
