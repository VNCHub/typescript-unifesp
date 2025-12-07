import express from 'express';
import path from 'path';
import router from './routes';

const app = express();

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static compiled frontend in /public
app.use(express.static(path.join(__dirname, '..', 'public')));


// routes
app.use('/', router);

// simple error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(err.status ?? 500).send(err.message ?? 'Internal Server Error');
});

export default app;