import 'express-validator';
import 'reflect-metadata';
import { initialiseDb } from './component/db';
import { createHttpServer } from './component/server';

initialiseDb().then(() => {
    createHttpServer();
});
