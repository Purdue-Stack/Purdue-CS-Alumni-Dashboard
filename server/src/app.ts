import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import uploadRouter from './routes/upload';

import indexRouter from './routes/index';
import usersRouter from './routes/users';
import adminRouter from './routes/admin';
import adminApiRouter from './routes/adminApi';
import analyticsRouter from './routes/analytics';
import publicRouter from './routes/public';
import { attachStubSession, requireAdminAccess } from './middleware/auth';

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(attachStubSession);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter)
app.use('/api', uploadRouter);
app.use('/api/admin', requireAdminAccess, adminApiRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api', publicRouter);

export default app;
