const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const recommendRoutes = require('./routes/recommend');
const locationRoutes = require('./routes/location');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/recommend', recommendRoutes);
app.use('/location', locationRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'EatWhat server is running 🍜' });
});

module.exports = app;