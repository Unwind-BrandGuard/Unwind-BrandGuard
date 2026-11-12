
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const analysisRoutes = require('./routes/analysisRoutes');
const invitationRoutes = require('./routes/invitationRoutes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Unwind BrandGuard backend is running!'
  });
});

app.use('/api/analyze', analysisRoutes);
app.use('/api/invitations', invitationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Unwind BrandGuard backend running on http://localhost:${PORT}`);
});