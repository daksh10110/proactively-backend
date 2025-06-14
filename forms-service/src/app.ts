import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import formRoutes from './routes/forms';
import authRoutes from './routes/auth';
import responseRoutes from './routes/response';
import { initDB } from './config/db';

dotenv.config();

const app = express();
const server = http.createServer(app);
import cors from 'cors';

app.use(cors());


app.use(express.json());
app.use('/api/forms', formRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/response', responseRoutes);
// app.use((req, res, next) => {
//     const { method, originalUrl } = req;
//     res.on('finish', () => {
//         console.log(`${method} ${originalUrl} - ${res.statusCode}`);
//     });
//     next();
// });
initDB();

server.listen(3000, () => console.log('Server running on http://localhost:3000'));