// src/config/database.js
"use strict";

const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
    });

    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected. Attempting reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected.");
    });

    return conn;
  } catch (err) {
    logger.error(`❌ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;