import { Router } from 'express';
import { getDB } from '../db.js';
import { ObjectId } from 'mongodb';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const db = await getDB();
    const { address, city, state, zip, propertyType } = req.body;
    const newProperty = {
      location: { address, city, state, zip },
      propertyType,
      averageRatings: {
        overall: 0,
        management: 0,
        safety: 0,
        noise: 0,
        cleanliness: 0,
      },
      reviewCount: 0,
      createdAt: new Date(),
    };
    const result = await db.collection('properties').insertOne(newProperty);
    res.status(201).json({ _id: result.insertedId, ...newProperty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;