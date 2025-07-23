const express = require('express');
const mongoose = require('mongoose');
const Hadith = require('../models/Hadith');
const app = express();

// Load environment variables manually if not already loaded
if (!process.env.MONGO_URI || !process.env.API_KEY) {
  require('dotenv').config();
}

const API_KEY = process.env.API_KEY;

app.use(express.json());

// 🔒 Middleware for API Key validation
const validateApiKey = (req, res, next) => {
  const clientKey = req.headers['x-api-key'];
  if (clientKey !== API_KEY) {
    return res.status(401).json({ error: 'Invalid API Key.' });
  }
  next();
};

// ✅ Public test route
app.get('/test', async (req, res) => {
  try {
    const result = await Hadith.find({
      hadithNumber: 1,
      bookSlug: 'sahih-bukhari'
    });

    if (result.length === 0) {
      return res.status(404).json({ status: false, message: 'No hadith found.' });
    }

    res.status(200).json({ status: true, data: result });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// ✅ POST API
app.post('/api/hadith', validateApiKey, async (req, res) => {
  const { hadithNumber, bookSlug } = req.body;

  if (!hadithNumber || !bookSlug) {
    return res.status(400).json({ error: 'hadithNumber and bookSlug are required.' });
  }

  try {
    const result = await Hadith.find({
      hadithNumber: parseInt(hadithNumber),
      bookSlug
    });

    if (result.length === 0) {
      return res.status(404).json({ status: false, message: 'No hadith found.' });
    }

    res.status(200).json({ status: true, data: result });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// ✅ GET API
app.get('/', validateApiKey, async (req, res) => {
  const { hidayatNo, bookSlug } = req.query;

  if (!hidayatNo || !bookSlug) {
    return res.status(400).json({ error: 'hidayatNo and bookSlug are required.' });
  }

  try {
    const result = await Hadith.find({
      hadithNumber: parseInt(hidayatNo),
      bookSlug
    });

    if (result.length === 0) {
      return res.status(404).json({ status: false, message: 'No hadith found.' });
    }

    res.status(200).json({ status: true, data: result });
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// ✅ MongoDB connection
let isConnected = false;
async function connectToMongo() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  isConnected = true;
  console.log('✅ MongoDB connected');
}

// ✅ Vercel handler export
module.exports = async (req, res) => {
  await connectToMongo();
  app(req, res);
};
