## YBT-DevOps-Project

Minimal Express + MongoDB demo.

Endpoints:
- `/` returns Hello, World!
- `/items` returns items from MongoDB collection

Env variables:
- `MONGO_URI` (required)
- `PORT` (default: 3000)

Local run:
```bash
npm install
MONGO_URI="mongodb://localhost:27017/ybt" npm run seed
MONGO_URI="mongodb://localhost:27017/ybt" npm start
```