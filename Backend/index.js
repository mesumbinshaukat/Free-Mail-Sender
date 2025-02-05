require('dotenv').config();
const express = require('express');
const cors = require("cors");
const multer = require('multer');
const connectDB = require('./db/config.js');
const { sendEmail, sendBulkEmailsFromCSV, sendBulkEmailsFromExcel } = require('controllers/EmailControllers.js');

const app = express();

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// CORS Configuration
const corsOptions = {
  origin: '*', // Allow all origins
  methods: ["GET", "POST"],
};
app.use(cors(corsOptions));
app.use(express.json());

// API Routes
app.post('/api/send-email', sendEmail);
app.post('/api/send-bulk-emails-from-csv', upload.single('file'), sendBulkEmailsFromCSV);
app.post('/api/send-bulk-emails-from-excel', upload.single('file'), sendBulkEmailsFromExcel);

// Connect to MongoDB
connectDB();

module.exports = app; // Serverless Function Export
