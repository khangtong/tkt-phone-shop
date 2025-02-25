import path from 'path';
import express from 'express';
import morgan from 'morgan';

import authRoutes from './routes/authRoute.js';
import productRoutes from './routes/productRoute.js';
import variationRoutes from './routes/variationRoute.js';
import categoryRoute from './routes/categoryRoute.js';

const app = express();

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/variations', variationRoutes);
app.use('/api/categories', categoryRoute);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;
