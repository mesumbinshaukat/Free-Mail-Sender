// utils/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Replace with your MongoDB connection string
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1); // Stop the server if the database connection fails
  }
};

module.exports = connectDB;
