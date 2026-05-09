import mongoose from "mongoose";
import { env } from "./env.js";

const connectDatabase = async () => {
  const mongoUri = env.mongoUri;

  if (!mongoUri) {
    console.warn("MONGODB_URI is not set. API will run without a database connection.");
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.warn(`MongoDB connection skipped: ${error.message}`);
  }
};

export default connectDatabase;
