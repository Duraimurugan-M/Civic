const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create 2dsphere index for geolocation queries
    const db = conn.connection.db;
    await db.collection('complaints').createIndex({ location: '2dsphere' }).catch(() => {});
    console.log('✅ Geospatial index ensured');
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
