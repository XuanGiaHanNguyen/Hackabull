require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});