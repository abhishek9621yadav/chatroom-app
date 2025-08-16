import mongoose from "mongoose";

export const connectDB = async () => {
  const DBURL = process.env.DB;
  if (!DBURL) throw new Error("No DB Url Found.");
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(DBURL);
      console.log("MongoDb Succesfully connected...");
    } else {
    //   console.log("\nDB Already connected...");
    }
  } catch (error) {
    console.log("Error connecting DB", error);
    process.exit(1);
  }
};
