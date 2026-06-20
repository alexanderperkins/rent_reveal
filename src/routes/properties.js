import { Router } from 'express';
import { getDB } from '../db.js';
import { ObjectId } from 'mongodb';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    const { q, search } = req.query;
    const query = q || search;
    const filter = query
      ? { 'location.address': { $regex: query, $options: 'i' } }
      : {};
    const properties = await db
      .collection('properties')
      .find(filter)
      .toArray();
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await getDB();
    const property = await db
      .collection('properties')
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!property) return res.status(404).json({ error: 'Not found' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = await getDB();
    const { address, city, state, zip, propertyType, lat, lng } = req.body;
    const newProperty = {
      location: { address, city, state, zip, lat, lng },
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
    if (err.code === 11000) {
      res.status(409).json({ error: 'Property already exists.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = await getDB();
    await db.collection('properties').deleteOne({ _id: new ObjectId(req.params.id) });
    await db.collection('reviews').deleteMany({ propertyId: new ObjectId(req.params.id) });
    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;