import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  directConnection: false,
});

let db;


export async function connectDB() {
  if (db) return db;
  await client.connect();
  db = client.db('rent_reveal');
  console.log('Connected to MongoDB');
  return db;
}

export async function getDB() {
  if (!db) throw new Error('DB not initialized. Call connectDB() first.');
  return db;
}