import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
config();

// Re-use a single MongoClient across requests
let clientPromise;

export const mongoDBConfiguration = (request, response, next) => {
    try {
            const client = new MongoClient(process.env.MONGO_URL);
            clientPromise = client.connect()
                .then((connectedClient) => {
                    console.log('Connected to MongoDB');
                    request.mongoDB = connectedClient.db(process.env.MONGO_DB_NAME);
                    next();
                })
                .catch((err) => {
                    console.error('Error connecting to MongoDB', err);
                    next(err);
                });
    } catch (err) {
        console.error('Unexpected error in mongoDBConfiguration', err);
        next(err);
    }
}
