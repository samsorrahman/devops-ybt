const express = require('express');
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const { MONGO_URI } = process.env;

// Create Express App
const app = express();
const port = 3000;

// Connect to MongoDB (replace <MONGO_SERVICE> with your MongoDB service in Kubernetes)
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Could not connect to MongoDB", err));

// Create a schema and model
const itemSchema = new mongoose.Schema({
    name: String,
    quantity: Number
});

const Item = mongoose.model('Item', itemSchema);

// Routes
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Route to fetch all items
app.get('/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
     
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
