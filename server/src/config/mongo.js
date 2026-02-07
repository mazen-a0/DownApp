const mongoose = require("mongoose");
async function connectMongo() {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
        throw new Error("MONGODB_URI is missing from environment variables");
    }

    try {
        await mongoose.connect(uri);
        console.log("SUCCESS: MongoDB connected");
    } catch (err) {
        console.error("ERROR: MongoDB connection error:", err.message);
        throw err;
    }
}

module.exports = { connectMongo };