const mongoose = require('mongoose');

const HadithSchema = new mongoose.Schema({
  hadithNumber: Number,
  englishNarrator: String,
  hadithEnglish: String,
  hadithUrdu: String,
  urduNarrator: String,
  hadithArabic: String,
  headingArabic: String,
  headingUrdu: String,
  headingEnglish: String,
  chapterId: Number,
  bookSlug: String,
  volume: String,
  status: String
});

module.exports = mongoose.model('Hadith', HadithSchema);
