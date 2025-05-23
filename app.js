// Express Imports
import express from 'express'; 

// express instance creation
export const app = express();

// Other Imports
import { Model } from 'objection'
import { knexDatabaseConfiguration } from './databaseConfiguration.js'
import cors from 'cors'

// body-parser 
import bodyParser from 'body-parser' 

// env imports
import { config } from 'dotenv';
config()
  
// Routes 
// Tags Input Router
import { tagsInputRouter } from './routes/tags_input.js'

// Use CORS middleware
app.use(cors());
// Middleware to set CORS headers
app.use((req, res, next) => { 
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');  
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); 
    res.setHeader('Access-Control-Allow-Credentials', true); 
    next(); 
});

// parsing body
app.use(bodyParser.json()); 

// establishing knex connection to Objection 
Model.knex(knexDatabaseConfiguration)

// Routes SetUp 
app.use(tagsInputRouter);

// Port Declaration 
app.listen(process.env.PORT) 

console.log(`Server listening in port ${process.env.PORT}`)