import express from 'express';
import logger from 'morgan';
import chatbotRouter from '../routes/chatbot.js';

const app = express();

app.use(express.json());
app.use(logger('dev'));
app.use('/', chatbotRouter);

export default app;
