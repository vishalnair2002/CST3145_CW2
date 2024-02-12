const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const app = express();
app.use(express.json());

let db;
const uri = 'mongodb+srv://vishalsunilnair30:Vishal2002@cluster1.mh2vfi9.mongodb.net/Activities';

// Connect to MongoDB
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to MongoDB');
        db = client.db('Activities');

        // Middleware to handle collection name parameter
        app.param('collectionName', (req, res, next, collectionName) => {
            req.collection = db.collection(collectionName);
            return next();
        });

        // Default route
        app.get('/', function (req, res) {
            res.send('Select a collection, e.g., /collection/messages');
        });

        // Retrieve all documents in a collection
        app.get('/collection/:collectionName', (req, res, next) => {
            req.collection.find({}).toArray((err, results) => {
                if (err) return next(err); // Pass error to error handler
                res.send(results);
            });
        });

        // Retrieve all lessons
        app.get('/lessons', (req, res, next) => {
            db.collection('lessons').find({}).toArray((err, lessons) => {
                if (err) return next(err);
                res.json(lessons);
            });
        });

        // Retrieve a specific document by ID
        app.get('/collection/:collectionName/:id', (req, res, next) => {
            req.collection.findOne(
                { _id: new ObjectID(req.params.id) },
                (err, result) => {
                    if (err) return next(err); // Pass error to error handler
                    res.send(result);
                }
            );
        });

        // Save a new order to the "order" collection
        app.post('/order', (req, res, next) => {
            db.collection('order').insertOne(req.body, (err, result) => {
                if (err) return next(err); // Pass error to error handler
                res.send(result.ops);
            });
        });

        // Update the number of available spaces in the "lesson" collection after an order is submitted
        app.put('/lesson/:id', (req, res, next) => {
            const lessonId = req.params.id;
            const newSpaces = req.body.spaces;

            db.collection('lessons').updateOne(
                { _id: new ObjectID(lessonId) },
                { $set: { spaces: newSpaces } },
                (err, result) => {
                    if (err) return next(err);
                    res.send(result.modifiedCount === 1 ? { msg: 'success' } : { msg: 'error' });
                }
            );
        });

        // Error handling middleware
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).send('Something broke!');
        });

        // Start Express server
        app.listen(3000, () => {
            console.log('Express.js server running at localhost:3000');
        });
    })
    .catch(err => {
        // Handle MongoDB connection error
        console.error('Error connecting to MongoDB:', err.message); // Log the error message
        console.error('Make sure MongoDB is running and the connection URI is correct.'); // Provide additional information
        process.exit(1); // Exit the application with a failure code
    });