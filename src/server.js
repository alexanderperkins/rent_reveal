import 'dotenv/config';
import express from 'express';
import { connectDB } from './db.js';
import propertiesRouter from './routes/properties.js';
import reviewsRouter from './routes/reviews.js';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(express.static('.'));

app.use('/api/properties', propertiesRouter);
app.use('/api/reviews', reviewsRouter);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});