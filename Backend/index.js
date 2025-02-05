require('dotenv').config();
const express = require('express');
const cors = require("cors");
const multer = require('multer');
const connectDB = require('./db/config');
const { sendEmail, sendBulkEmailsFromCSV, sendBulkEmailsFromExcel } = require('./controllers/EmailControllers');

const app = express();

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// CORS Configuration
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ["GET", "POST"],
};
app.use(cors(corsOptions));
app.use(express.json());

// API Routes
app.post('/api/send-email', sendEmail);
app.post('/api/send-bulk-emails-from-csv', upload.single('file'), sendBulkEmailsFromCSV);
app.post('/api/send-bulk-emails-from-excel', upload.single('file'), sendBulkEmailsFromExcel);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await connectDB();
});
