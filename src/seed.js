import 'dotenv/config';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

const addresses = [
  { address: '1 Charles Street', city: 'Boston', state: 'MA', zip: '02114' },
  { address: '10 Beacon Street', city: 'Boston', state: 'MA', zip: '02108' },
  { address: '25 Commonwealth Ave', city: 'Boston', state: 'MA', zip: '02116' },
  { address: '47 Newbury Street', city: 'Boston', state: 'MA', zip: '02116' },
  { address: '83 Marlborough Street', city: 'Boston', state: 'MA', zip: '02116' },
  { address: '12 Garden Street', city: 'Cambridge', state: 'MA', zip: '02138' },
  { address: '34 Brattle Street', city: 'Cambridge', state: 'MA', zip: '02138' },
  { address: '56 Massachusetts Ave', city: 'Cambridge', state: 'MA', zip: '02139' },
  { address: '78 Prospect Street', city: 'Cambridge', state: 'MA', zip: '02139' },
  { address: '9 Porter Road', city: 'Cambridge', state: 'MA', zip: '02140' },
  { address: '15 Elm Street', city: 'Somerville', state: 'MA', zip: '02143' },
  { address: '28 Highland Ave', city: 'Somerville', state: 'MA', zip: '02143' },
  { address: '42 Broadway', city: 'Somerville', state: 'MA', zip: '02145' },
  { address: '67 Washington Street', city: 'Somerville', state: 'MA', zip: '02143' },
  { address: '91 Union Square', city: 'Somerville', state: 'MA', zip: '02143' },
  { address: '3 Harvard Street', city: 'Brookline', state: 'MA', zip: '02445' },
  { address: '19 Coolidge Corner', city: 'Brookline', state: 'MA', zip: '02446' },
  { address: '55 Green Street', city: 'Jamaica Plain', state: 'MA', zip: '02130' },
  { address: '77 Centre Street', city: 'Jamaica Plain', state: 'MA', zip: '02130' },
  { address: '101 Tremont Street', city: 'Boston', state: 'MA', zip: '02108' },
  { address: '200 Boylston Street', city: 'Boston', state: 'MA', zip: '02116' },
  { address: '14 East Springfield Street', city: 'Boston', state: 'MA', zip: '02118' },
  { address: '33 Rutland Square', city: 'Boston', state: 'MA', zip: '02118' },
  { address: '88 West Concord Street', city: 'Boston', state: 'MA', zip: '02118' },
  { address: '6 Symphony Road', city: 'Boston', state: 'MA', zip: '02115' },
  { address: '22 Westland Ave', city: 'Boston', state: 'MA', zip: '02115' },
  { address: '45 Queensberry Street', city: 'Boston', state: 'MA', zip: '02215' },
  { address: '11 Burbank Street', city: 'Boston', state: 'MA', zip: '02115' },
  { address: '39 Hemenway Street', city: 'Boston', state: 'MA', zip: '02115' },
  { address: '5 Westville Street', city: 'Dorchester', state: 'MA', zip: '02121' },
  { address: '18 Geneva Ave', city: 'Dorchester', state: 'MA', zip: '02121' },
  { address: '72 Bowdoin Street', city: 'Dorchester', state: 'MA', zip: '02122' },
  { address: '29 Adams Street', city: 'Dorchester', state: 'MA', zip: '02122' },
  { address: '54 Savin Hill Ave', city: 'Dorchester', state: 'MA', zip: '02125' },
  { address: '8 Telegraph Street', city: 'South Boston', state: 'MA', zip: '02127' },
  { address: '44 East Broadway', city: 'South Boston', state: 'MA', zip: '02127' },
  { address: '66 West Fourth Street', city: 'South Boston', state: 'MA', zip: '02127' },
  { address: '13 Emerson Street', city: 'South Boston', state: 'MA', zip: '02127' },
  { address: '37 Silver Street', city: 'South Boston', state: 'MA', zip: '02127' },
  { address: '21 Winthrop Street', city: 'Charlestown', state: 'MA', zip: '02129' },
  { address: '48 Bunker Hill Street', city: 'Charlestown', state: 'MA', zip: '02129' },
  { address: '7 Monument Ave', city: 'Charlestown', state: 'MA', zip: '02129' },
  { address: '16 Lexington Street', city: 'East Boston', state: 'MA', zip: '02128' },
  { address: '53 Bennington Street', city: 'East Boston', state: 'MA', zip: '02128' },
  { address: '31 Meridian Street', city: 'East Boston', state: 'MA', zip: '02128' },
  { address: '4 Sumner Street', city: 'East Boston', state: 'MA', zip: '02128' },
  { address: '62 Maverick Street', city: 'East Boston', state: 'MA', zip: '02128' },
  { address: '27 Hyde Park Ave', city: 'Hyde Park', state: 'MA', zip: '02136' },
  { address: '43 Fairmount Ave', city: 'Hyde Park', state: 'MA', zip: '02136' },
  { address: '19 Cummins Highway', city: 'Roslindale', state: 'MA', zip: '02131' },
];

const propertyTypes = ['apartment', 'condo', 'house', 'studio', 'townhouse'];

const comments = [
  'Great location, close to the T. Landlord was responsive.',
  'Noisy neighbors and thin walls. Would not recommend.',
  'Management took weeks to fix a broken heater in winter.',
  'Love the neighborhood. Building is well maintained.',
  'Mice problem that management ignored for months.',
  'Perfect for students. Close to campus and restaurants.',
  'Heat included in rent which was a huge bonus.',
  'Landlord entered without notice multiple times.',
  'Beautiful apartment, a bit pricey but worth it.',
  'Mold in the bathroom that was never properly fixed.',
  'Super responsive management team. Best place I have lived.',
  'Street noise at night made it hard to sleep.',
  'Great natural light and updated appliances.',
  'Parking situation was a nightmare.',
  'Quiet building with friendly neighbors.',
  'The hallways were always dirty and poorly lit.',
  'Amazing rooftop deck with views of the city.',
  'Heat barely worked all winter. Constant complaints ignored.',
  'Very clean and modern. Worth every penny.',
  'Cockroach infestation that management denied.',
  'Friendly landlord who fixed things same day.',
  'Drafty windows made winter unbearable.',
  'Great value for the neighborhood.',
  'Security deposit was unfairly withheld.',
  'Loved living here. Would move back in a heartbeat.',
  'Package theft was a recurring issue.',
  'Perfect location for commuting downtown.',
  'Walls are paper thin, can hear everything.',
  'Well maintained building with professional staff.',
  'Laundry machines always broken.',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomRating() {
  return randomInt(1, 5);
}

function randomDate() {
  var start = new Date(2022, 0, 1);
  var end = new Date(2025, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seed() {
  await client.connect();
  const db = client.db('rent_reveal');

  console.log('Clearing existing data...');
  await db.collection('properties').deleteMany({});
  await db.collection('reviews').deleteMany({});

  console.log('Seeding properties...');
  const propertyDocs = addresses.map(function (a) {
    return {
      location: { address: a.address, city: a.city, state: a.state, zip: a.zip },
      propertyType: propertyTypes[randomInt(0, propertyTypes.length - 1)],
      averageRatings: { overall: 0, management: 0, safety: 0, noise: 0, cleanliness: 0 },
      reviewCount: 0,
      createdAt: new Date(),
    };
  });

  const propertyResult = await db.collection('properties').insertMany(propertyDocs);
  const propertyIds = Object.values(propertyResult.insertedIds);
  console.log('Inserted ' + propertyIds.length + ' properties.');

  console.log('Seeding reviews...');
  var allReviews = [];

  for (var i = 0; i < propertyIds.length; i++) {
    var numReviews = randomInt(15, 30);
    for (var j = 0; j < numReviews; j++) {
      allReviews.push({
        propertyId: propertyIds[i],
        ratings: {
          overall: randomRating(),
          management: randomRating(),
          safety: randomRating(),
          noise: randomRating(),
          cleanliness: randomRating(),
        },
        comments: comments[randomInt(0, comments.length - 1)],
        createdAt: randomDate(),
      });
    }
  }

  await db.collection('reviews').insertMany(allReviews);
  console.log('Inserted ' + allReviews.length + ' reviews.');

  console.log('Recalculating averages...');
  for (var i = 0; i < propertyIds.length; i++) {
    var reviews = await db.collection('reviews')
      .find({ propertyId: propertyIds[i] })
      .toArray();

    var count = reviews.length;
    var avg = function (field) {
      return reviews.reduce(function (sum, r) { return sum + (r.ratings[field] || 0); }, 0) / count;
    };

    await db.collection('properties').updateOne(
      { _id: propertyIds[i] },
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

  console.log('Done! Database seeded successfully.');
  await client.close();
}

seed().catch(function (err) {
  console.error(err);
  client.close();
});