import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import logger from 'morgan';
import uploadRouter from './routes/upload';

import indexRouter from './routes/index';
import usersRouter from './routes/users';
import adminRouter from './routes/admin';
import adminApiRouter from './routes/adminApi';
import authRouter from './routes/auth';
import analyticsRouter from './routes/analytics';
import publicRouter from './routes/public';
import { attachSession, requireAdminAccess } from './middleware/auth';

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5678',
    'http://127.0.0.1:5678'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(attachSession);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/admin', requireAdminAccess, adminRouter);
app.use('/api/admin', requireAdminAccess, adminApiRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api', publicRouter);
app.use('/api', requireAdminAccess, uploadRouter);

export default app;
