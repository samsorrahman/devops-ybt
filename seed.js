// seed.js (fixed)
require('dotenv').config({ path: './.env' });  // load first
const mongoose = require('mongoose');

const { MONGO_URI } = process.env;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB for seeding");
    await seedData();
    mongoose.connection.close();
  })
  .catch(err => {
    console.error("Could not connect to MongoDB", err);
    process.exit(1);
  });

const itemSchema = new mongoose.Schema({ name: String, quantity: Number });
const Item = mongoose.model('Item', itemSchema);

const seedItems = [
  { name: "Apple", quantity: 50 },
  { name: "Banana", quantity: 30 },
  { name: "Orange", quantity: 20 },
  { name: "Mango", quantity: 15 },
  { name: "Kiwi", quantity: 10 }
];

async function seedData() {
  try {
    await Item.deleteMany({});
    console.log("Cleared existing items");
    await Item.insertMany(seedItems);
    console.log("Seeded items successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}
