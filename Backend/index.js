require('dotenv').config();
const express = require('express');
const app = express();
const cors = require("cors");

// CORS options
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.get('/', (req, res) => {
  res.send('Email Marketing Tool API');
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // await connectDB(); // Connect to the database
});