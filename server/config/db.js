import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartecommerce';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    isConnected = true;
    console.log(` MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(` [MongoDB Note] Could not connect to MongoDB at ${uri}: ${error.message}`);
    console.warn(' Server is running in resilient in-memory hybrid mode for zero interruption.');
    isConnected = false;
    return false;
  }
};

export const getDBStatus = () => isConnected;
