// --- MODULE IMPORTS ---
require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios'); // For making external API calls
const session = require('express-session'); // For user session management
const passport = require('passport'); // For OAuth 2.0

// Load Passport configuration and pass the passport instance
require('./config/passport')(passport); 

// --- MODEL IMPORTS ---
const Record = require('./models/record');

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---

// 1. JSON and Static File serving
app.use(express.json());

// 2. Session Middleware (MUST be before Passport)
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    proxy: true, // CRITICAL FIX: Ensures session works behind proxies (dev environment)
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24,
        secure: false, // CRITICAL FIX: Allows cookies over HTTP
        httpOnly: true
    } 
}));

// 3. Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// 4. Static File serving (Must be AFTER session/passport for context)
app.use(express.static(path.join(__dirname, 'public')));


// --- SECURITY MIDDLEWARE ---

// Middleware to require Application API Key in the request header (Application-Level Security)
const verifyApiKey = (req, res, next) => {
    const clientKey = req.headers['x-app-api-key']; 
    if (clientKey && clientKey === process.env.CLIENT_API_KEY) {
        return next(); 
    }
    res.status(401).json({ message: 'Unauthorized: Invalid Application API Key' });
};

// Middleware to ensure user is logged in (User-Level Security)
const ensureAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized: User must be logged in to access this resource.' });
};


// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));


// --- API AGGREGATION FUNCTIONS (Unchanged, as they are stable) ---

async function getCityDetails(city) {
    const geoDbUrl = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities`;
    try {
        const response = await axios.get(geoDbUrl, {
            params: { namePrefix: city, limit: 1, includeDeleted: 'none', sort: '-population' },
            headers: { 'x-rapidapi-key': process.env.GEODB_API_KEY, 'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com' }
        });
        const cityData = response.data.data[0];
        if (!cityData) { throw new Error('City not found via GeoDB.'); }
        return { city: cityData.name, country: cityData.country, lat: cityData.latitude, lon: cityData.longitude, population: cityData.population };
    } catch (error) { throw new Error(`GeoDB Error: ${error.message}`); }
}

async function getAirQuality(lat, lon) {
    const openAqUrl = `https://api.openaq.org/v2/latest`;
    try {
        const response = await axios.get(openAqUrl, {
            params: { coordinates: `${lat},${lon}`, radius: 10000, limit: 1, parameter: 'pm25' },
            headers: { 'Authorization': process.env.OPERAQ_API_KEY } 
        });
        const result = response.data.results[0]?.measurements[0];
        if (!result) { return { airQualityRaw: 15.0, unit: 'µg/m³' }; }
        return { airQualityRaw: result.value, unit: result.unit };
    } catch (error) {
        console.warn(`OpenAQ Error: ${error.message}. Using default AQ value.`);
        return { airQualityRaw: 15.0, unit: 'µg/m³' };
    }
}

async function getWeather(lat, lon) {
    const openWeatherUrl = `http://api.openweathermap.org/data/2.5/weather`;
    try {
        const response = await axios.get(openWeatherUrl, {
            params: { lat: lat, lon: lon, appid: process.env.OPENWEATHERMAP_API_KEY, units: 'standard' }
        });
        return { temperatureRaw: response.data.main.temp };
    } catch (error) { throw new Error(`OpenWeatherMap Error: ${error.message}`); }
}


// --- 1. AUTH ROUTES ---

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => { res.redirect('/'); });
app.get('/auth/logout', (req, res, next) => { req.logout((err) => { if (err) { return next(err); } res.redirect('/'); }); });
app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) { res.json({ id: req.user.id, displayName: req.user.displayName }); } 
    else { res.status(401).json({ message: 'Not authenticated' }); }
});


// --- 2. CORE PROJECT API ENDPOINTS ---

app.get('/api/calculate-score', async (req, res) => {
    const city = req.query.city;
    if (!city) { return res.status(400).json({ message: 'City parameter is required.' }); }

    try {
        const cityDetails = await getCityDetails(city);
        const [aqData, weatherData] = await Promise.all([
            getAirQuality(cityDetails.lat, cityDetails.lon),
            getWeather(cityDetails.lat, cityDetails.lon)
        ]);
        
        const rawData = {
            city: cityDetails.city, country: cityDetails.country, population: cityDetails.population,
            airQualityRaw: aqData.airQualityRaw, temperatureRaw: weatherData.temperatureRaw 
        };
        res.json(rawData);

    } catch (error) {
        console.error('API Aggregation Failed:', error.message);
        res.status(500).json({ message: 'Failed to fetch city data from external APIs.', error: error.message });
    }
});


app.post('/saveData', verifyApiKey, ensureAuth, async (req, res) => {
    try {
        const { city, country, totalScore, wellbeingFactors } = req.body;
        const newRecord = new Record({ userId: req.user.id, city, country, totalScore, wellbeingFactors });
        await newRecord.save();
        res.status(201).json({ message: 'Record saved successfully', record: newRecord });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ message: 'Failed to save record', error: error.message });
    }
});


app.get('/records', verifyApiKey, ensureAuth, async (req, res) => {
    try {
        const records = await Record.find({ userId: req.user.id }).sort({ totalScore: -1 });
        res.json(records);
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ message: 'Failed to retrieve records', error: error.message });
    }
});


// --- FALLBACK ROUTE ---
// Fallback route (SPA support)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});





// --- SERVER STARTUP ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});