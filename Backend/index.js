require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const connectDB = require('./db/config.js');
const { sendEmail, sendBulkEmailsFromCSV, sendBulkEmailsFromExcel } = require('./controllers/EmailControllers.js');
const serverless = require('serverless-http'); // Add this line

const app = express();

// Multer Configuration (Memory Storage)
const upload = multer({ storage: multer.memoryStorage() }); // Updated for serverless

// CORS Configuration
const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST'],
};
app.use(cors(corsOptions));
app.use(express.json());

// API Routes
app.post('/api/send-email', sendEmail);
app.post('/api/send-bulk-emails-from-csv', upload.single('file'), sendBulkEmailsFromCSV);
app.post('/api/send-bulk-emails-from-excel', upload.single('file'), sendBulkEmailsFromExcel);

// Connect to MongoDB
connectDB();

// Export for Appwrite Serverless
module.exports.handler = serverless(app); // Updated for serverless