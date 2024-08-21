/**
 * Imports
 */
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
const app = express();
dotenv.config();

/**
 * Database Connection
 */
const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database Connected")
    } catch (error) {
        throw error;
    }
}

app.listen(8800, () => {
    connectMongoDB();
    console.log("Backend Connected");
});

/**
 *  Setting up 
 */