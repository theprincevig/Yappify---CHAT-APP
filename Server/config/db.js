// --------------------
// Import dependencies
// --------------------
const mongoose = require('mongoose'); // Mongoose library for MongoDB

// --------------------
// Database connection string
// --------------------
const DB_URL = process.env.ATLASDB_URL; // MongoDB Atlas connection URL

// --------------------
// Connect to MongoDB
// --------------------
module.exports.connectDB = async () => {
    if (!DB_URL) {
        console.error("MongoDB connection string is missing (ATLASDB_URL not set)");
        process.exit(1);
    }

    try {
        // Try connecting to MongoDB using Mongoose
        const conn = await mongoose.connect(DB_URL);
        console.log(`Connected to DB: --> ${conn.connection.name} <--`);    // Would display the database name
    } catch (error) {
        // Connection failed
        console.error(`connection failed ${error.message}`);
        process.exit(1); // Exit the process with failure code
    }
};
