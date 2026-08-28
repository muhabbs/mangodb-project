const mongoose = require("mongoose");

let cached = global.mongooseConnection;

if (!cached) {
  cached = global.mongooseConnection = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required");
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
