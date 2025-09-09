const express = require('express')
require('dotenv').config({ path: './.env' })
const mongoose = require('mongoose')
const client = require('prom-client')
const { MONGO_URI } = process.env

const app = express()
const port = 3000

// Prometheus metrics
const register = new client.Registry()

// Add default metrics
client.collectDefaultMetrics({ register })

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
})

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
})

const mongoConnectionStatus = new client.Gauge({
  name: 'mongo_connection_status',
  help: 'MongoDB connection status (1 = connected, 0 = disconnected)'
})

const itemsCount = new client.Gauge({
  name: 'items_count',
  help: 'Total number of items in the database'
})

// Register custom metrics
register.registerMetric(httpRequestDuration)
register.registerMetric(httpRequestTotal)
register.registerMetric(mongoConnectionStatus)
register.registerMetric(itemsCount)

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB')
    mongoConnectionStatus.set(1)
  })
  .catch(err => {
    console.error('Could not connect to MongoDB', err)
    mongoConnectionStatus.set(0)
  })

const itemSchema = new mongoose.Schema({
  name: String,
  quantity: Number
})

const Item = mongoose.model('Item', itemSchema)

// Middleware to track HTTP requests
app.use((req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000
    const route = req.route ? req.route.path : req.path
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration)
    
    httpRequestTotal
      .labels(req.method, route, res.statusCode)
      .inc()
  })
  
  next()
})

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    // Update items count
    const count = await Item.countDocuments()
    itemsCount.set(count)
    
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
  } catch (error) {
    res.status(500).end(error.message)
  }
})

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
