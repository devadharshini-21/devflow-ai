const mongoose = require("mongoose");

const connectDB = async (retries = 5, delay = 1500) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        family: 4,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
      });

      console.log("✅ MongoDB Connected Successfully");
      return;
    } catch (error) {
      console.error(`⚠️ MongoDB Connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error("❌ MongoDB Connection Failed after maximum retries");
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;