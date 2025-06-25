const express = require('express');
const router = express.Router();
const Hadith = require('../models/Hadith');

const validateApiKey = (req, res, next) => {
  const key = req.headers['x-apikey'];
  if (key !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

router.get('/', validateApiKey, async (req, res) => {
  const { hidayatNo, bookName } = req.query;

  if (!hidayatNo || !bookName) {
    return res.status(400).json({ error: 'Missing hidayatNo or bookName' });
  }

  try {
    const hadith = await Hadith.findOne({
      hadithNumber: parseInt(hidayatNo),
      book: bookName
    });

    if (!hadith) {
      return res.status(404).json({ message: 'Hadith not found' });
    }

    res.json(hadith);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
