const express = require('express')
require('dotenv').config({ path: './.env' })
const mongoose = require('mongoose')
const { MONGO_URI } = process.env

const app = express()
const port = 3000

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err))

const itemSchema = new mongoose.Schema({
  name: String,
  quantity: Number
})

const Item = mongoose.model('Item', itemSchema)

app.get('/', (req, res) => {
  res.send('Hello, World!')
})

app.get('/items', async (req, res) => {
  try {
    const items = await Item.find()
    res.json(items)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
