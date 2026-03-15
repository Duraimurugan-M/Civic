const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    }

    // Ensure geospatial index exists
    await conn.connection.db
      .collection('complaints')
      .createIndex({ location: '2dsphere' })
      .catch(() => {
        // Index may already exist — safe to ignore
      });

  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;