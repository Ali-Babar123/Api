require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Hadith = require('./models/Hadith');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

app.use(express.json());

// 🔒 Middleware for API Key validation
const validateApiKey = (req, res, next) => {
  const clientKey = req.headers['x-api-key'];
  console.log('🔐 Client Key:', clientKey);
  console.log('🔐 Expected Key:', API_KEY);

  if (clientKey !== API_KEY) {
    return res.status(401).json({ error: 'Invalid API Key.' });
  }
  next();
};

// ✅ Public test route to view JSON in browser (GET /test)
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

// ✅ POST API (Body: hadithNumber, bookSlug)
app.post('/api/hadith', validateApiKey, async (req, res) => {
  const { hadithNumber, bookSlug } = req.body;

  if (!hadithNumber || !bookSlug) {
    return res.status(400).json({ error: 'hadithNumber and bookSlug are required in request body.' });
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

// ✅ GET API (Query: ?hidayatNo=1&bookSlug=sahih-bukhari)
app.get('/', validateApiKey, async (req, res) => {
  const { hidayatNo, bookSlug } = req.query;

  if (!hidayatNo || !bookSlug) {
    return res.status(400).json({ error: 'hidayatNo and bookSlug are required in query.' });
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

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});
