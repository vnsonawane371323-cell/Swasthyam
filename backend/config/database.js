const mongoose = require('mongoose');

const connectDB = async (retries = 5, delay = 5000) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    
    if (retries > 0) {
      console.log(`Retrying connection in ${delay / 1000} seconds... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1, delay), delay);
    } else {
      console.error('Could not connect to MongoDB after multiple attempts. Please check:');
      console.error('1. Your IP is whitelisted in MongoDB Atlas');
      console.error('2. Your MONGODB_URI is correct in .env file');
      console.error('3. Your cluster is active and running');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
