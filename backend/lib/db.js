import mongoose from 'mongoose';

// Check for both possible environment variable names
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI or MONGODB_URI environment variable');
}

// Log the first part of the URI to verify it's working (without exposing credentials)
console.log('MongoDB URI detected:', MONGO_URI.substring(0, MONGO_URI.indexOf('@') > 0 ? MONGO_URI.indexOf('@') : 15) + '...');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDB() {
  if (cached.conn) {
    console.log('Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    console.log('Creating new MongoDB connection');
    
    cached.promise = mongoose.connect(MONGO_URI, options)
      .then(mongoose => {
        console.log('Successfully connected to MongoDB');
        return mongoose;
      })
      .catch(err => {
        console.error('MongoDB connection error:', err);
        cached.promise = null; // Reset so we can try again
        throw err;
      });
  } else {
    console.log('Reusing existing MongoDB connection promise');
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('Error resolving MongoDB connection:', error);
    throw error;
  }
}