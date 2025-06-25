require('dotenv').config();
const mongoose = require('mongoose');
const Hadith = require('./models/Hadith');
const data = require('./data/seed.json');

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await Hadith.deleteMany(); // Optional: clear collection
    await Hadith.insertMany(data);

    console.log('✅ Seeding complete');
    process.exit();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedDB();
