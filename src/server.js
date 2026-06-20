import 'dotenv/config';
import express from 'express';
import { connectDB } from './db.js';
import propertiesRouter from './routes/properties.js';
import reviewsRouter from './routes/reviews.js';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors({
  origin: ['https://rent-reveal.netlify.app', 'http://localhost:3000']
}));

app.use(express.json());
app.use(express.static(__dirname + '/..'));

app.use('/api/properties', propertiesRouter);
app.use('/api/reviews', reviewsRouter);

app.get('/api/config', (req, res) => {
  res.json({ mapsApiKey: process.env.MAPS_API_KEY });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});

app.get('/api/config', (req, res) => {
  res.json({ mapsApiKey: process.env.MAPS_API_KEY });
});