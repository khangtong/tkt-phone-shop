import path from 'path';
import express from 'express';
import morgan from 'morgan';

import authRoutes from './routes/authRoute.js';
import productRoutes from './routes/productRoute.js';
import variationRoutes from './routes/variationRoute.js';
import categoryRoute from './routes/categoryRoute.js';
import cartRoute from './routes/cartRoute.js';
import cartDetailRoute from './routes/cartDetailRoute.js';
import discountRoute from './routes/discountRoute.js';
import orderRoute from './routes/orderRoute.js';
import orderDetailRoute from './routes/orderDetailRoute.js';
import paymentRoute from './routes/paymentRoute.js';

const app = express();
// app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/variations', variationRoutes);
app.use('/api/categories', categoryRoute);
app.use('/api/carts', cartRoute);
app.use('/api/cart-details', cartDetailRoute);
app.use('/api/discounts', discountRoute);
app.use('/api/orders', orderRoute);
app.use('/api/order-details', orderDetailRoute);
app.use('/api/payment', paymentRoute);

app.get('/', (req, res) => {
	res.send('Hello World!');
});

export default app;
