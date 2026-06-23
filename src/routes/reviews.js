import { Router } from 'express';
import { getDB } from '../db.js';
import { ObjectId } from 'mongodb';

const router = Router();

async function recalcRatings(db, propertyId) {
  const reviews = await db
    .collection('reviews')
    .find({ propertyId: new ObjectId(propertyId) })
    .toArray();

  const count = reviews.length;
  const avg = (field) =>
    count
      ? reviews.reduce((sum, r) => sum + (r.ratings[field] ?? 0), 0) / count
      : 0;

  await db.collection('properties').findOneAndUpdate(
    { _id: new ObjectId(propertyId) },
    {
      $set: {
        reviewCount: count,
        'averageRatings.overall': avg('overall'),
        'averageRatings.management': avg('management'),
        'averageRatings.safety': avg('safety'),
        'averageRatings.noise': avg('noise'),
        'averageRatings.cleanliness': avg('cleanliness'),
      },
    }
  );
}
// GET /api/reviews?propertyId=
router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    const { propertyId } = req.query;
    if (!propertyId)
      return res.status(400).json({ error: 'propertyId required' });
    const reviews = await db
      .collection('reviews')
      .find({ propertyId: new ObjectId(propertyId) })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews
router.post('/', async (req, res) => {
  try {
    const db = await getDB();
    const { propertyId, ratings, comments } = req.body;
    const newReview = {
      propertyId: new ObjectId(propertyId),
      ratings,
      comments,
      createdAt: new Date(),
    };
    const result = await db.collection('reviews').insertOne(newReview);
    await recalcRatings(db, propertyId);
    res.status(201).json({ _id: result.insertedId, ...newReview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/reviews/:id
router.put('/:id', async (req, res) => {
  try {
    const db = await getDB();
    const { ratings, comments } = req.body;
    const result = await db
      .collection('reviews')
      .findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: { ratings, comments } },
        { returnDocument: 'after' }
      );
    await recalcRatings(db, result.propertyId.toString());
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/reviews/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDB();
    const review = await db
      .collection('reviews')
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!review) return res.status(404).json({ error: 'Not found' });
    await db
      .collection('reviews')
      .deleteOne({ _id: new ObjectId(req.params.id) });
    await recalcRatings(db, review.propertyId.toString());
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
