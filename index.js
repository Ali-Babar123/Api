const express = require('express');
const mongoose = require('mongoose');
const Hadith = require('../models/Hadith');
const serverless = require('serverless-http');

const app = express();

// Load environment variables manually if not already loaded
if (!process.env.MONGO_URI || !process.env.API_KEY) {
  require('dotenv').config();
}

const API_KEY = process.env.API_KEY;
let isConnected = false;

app.use(express.json());

// ✅ MongoDB connection
async function connectToMongo() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = true;
  console.log('✅ MongoDB connected');
}

// 🔒 API Key middleware
const validateApiKey = (req, res, next) => {
  const clientKey = req.headers['x-api-key'];
  if (clientKey !== API_KEY) {
    return res.status(401).json({ error: 'Invalid API Key.' });
  }
  next();
};

// ✅ Public route
app.get('/api/test', async (req, res) => {
  await connectToMongo();
  try {
    const result = await Hadith.find({
      hadithNumber: 1,
      bookSlug: 'sahih-bukhari',
    });
    if (!result.length) {
      return res.status(404).json({ status: false, message: 'No hadith found.' });
    }
    res.status(200).json({ status: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST endpoint
app.post('/api/hadith', validateApiKey, async (req, res) => {
  await connectToMongo();
  const { hadithNumber, bookSlug } = req.body;
  if (!hadithNumber || !bookSlug) {
    return res.status(400).json({ error: 'hadithNumber and bookSlug are required.' });
  }

  try {
    const result = await Hadith.find({ hadithNumber: parseInt(hadithNumber), bookSlug });
    if (!result.length) {
      return res.status(404).json({ status: false, message: 'No hadith found.' });
    }
    res.status(200).json({ status: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET endpoint
app.get('/api', validateApiKey, async (req, res) => {
  await connectToMongo();
  const { hidayatNo, bookSlug } = req.query;
  if (!hidayatNo || !bookSlug) {
    return res.status(400).json({ error: 'hidayatNo and bookSlug are required.' });
  }

  try {
    const result = await Hadith.find({ hadithNumber: parseInt(hidayatNo), bookSlug });
    if (!result.length) {
      return res.status(404).json({ status: false, message: 'No hadith found.' });
    }
    res.status(200).json({ status: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Export the serverless handler
module.exports = serverless(app);
