
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());

// Health-check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Unwind BrandGuard backend is running!'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Unwind BrandGuard backend running on http://localhost:${PORT}`);
});
