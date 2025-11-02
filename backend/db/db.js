import mongoose from "mongoose";
import 'dotenv/config';

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("MongoDB Connection Failed:", err.message);
    process.exit(1); // stop app if db connection fails
  }
};

export default connect;
