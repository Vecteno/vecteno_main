import mongoose from "mongoose";

// Connection state tracking
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRIES = 3;
let connectionPromise = null;

// Default MongoDB Atlas connection string
const DEFAULT_MONGO_URI = 'mongodb+srv://mmdemomail123:demo123@vectenodemo.6wjmcwa.mongodb.net/vecteno?retryWrites=true&w=majority';

const connectToDatabase = async () => {
    // If already connected, return immediately
    if (mongoose.connection.readyState === 1) {
        console.log('Using existing MongoDB connection');
        return mongoose.connection;
    }

    // If there's already a connection attempt in progress, wait for it
    if (connectionPromise) {
        console.log('Waiting for existing connection attempt...');
        return connectionPromise;
    }

    // Only disconnect if we're in a bad state (not connecting or connected)
    if (mongoose.connection.readyState === 3) { // disconnected
        console.log('Reconnecting to MongoDB...');
    }

    // Create connection promise to avoid multiple simultaneous connections
    connectionPromise = (async () => {
        try {
            const mongoUri = process.env.MongoURL || DEFAULT_MONGO_URI;
            
            console.log(`Connecting to MongoDB (Attempt ${connectionAttempts + 1}/${MAX_RETRIES})...`);
            
            const connectionOptions = {
                serverSelectionTimeoutMS: 15000, // 15 seconds timeout
                socketTimeoutMS: 60000, // 60 seconds socket timeout
                connectTimeoutMS: 15000, // 15 seconds connection timeout
                maxPoolSize: 10, // Maximum number of connections in the connection pool
                minPoolSize: 1, // Maintain at least 1 connection
            };

            await mongoose.connect(mongoUri, connectionOptions);
            
            isConnected = true;
            connectionAttempts = 0;
            console.log('Successfully connected to MongoDB');
            
            // Set up connection event handlers only once
            if (!mongoose.connection.listeners('connected').length) {
                mongoose.connection.on('connected', () => {
                    console.log('MongoDB connected');
                    isConnected = true;
                });

                mongoose.connection.on('error', (err) => {
                    console.error('MongoDB connection error:', err);
                    isConnected = false;
                    connectionPromise = null;
                });

                mongoose.connection.on('disconnected', () => {
                    console.log('MongoDB disconnected');
                    isConnected = false;
                    connectionPromise = null;
                });
            }
            
            return mongoose.connection;
        } catch (error) {
            connectionPromise = null;
            throw error;
        }
    })();
    
    try {
        return await connectionPromise;
        
    } catch (error) {
        connectionAttempts++;
        console.error('MongoDB connection failed:', error.message);
        
        if (connectionAttempts < MAX_RETRIES) {
            console.log(`Retrying connection (${connectionAttempts}/${MAX_RETRIES})...`);
            // Wait for 1 second before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            return connectToDatabase();
        }
        
        console.error('Max connection attempts reached. Please check your MongoDB connection.');
        throw new Error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts: ${error.message}`);
    }
};

// Handle process termination
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
    }
});

export default connectToDatabase;