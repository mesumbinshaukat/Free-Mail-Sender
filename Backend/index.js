require('dotenv').config();
const express = require('express');
const app = express();
const cors = require("cors");
const connectDB = require('./db/config');
const {sendEmail, sendBulkEmailsFromCSV, sendBulkEmailsFromExcel} = require('./controllers/emailControllers');

// CORS options
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EMAIL API
app.post('/api/send-email', sendEmail); 
app.post('/api/send-bulk-emails-from-csv', sendBulkEmailsFromCSV);
app.post('/api/send-bulk-emails-from-excel', sendBulkEmailsFromExcel);


const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await connectDB(); // Connect to the database
});