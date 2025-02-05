require('dotenv').config();
const nodemailer = require('nodemailer');
const async = require('async');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const stream = require('stream'); // Add this for buffer processing
const EmailLog = require('../models/EmailLog');

// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.HOST_NAME,
  port: process.env.EMAIL_PORT,
  logger: true,
  debug: true,
  secureConnection: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Regex to validate email addresses
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Function to detect email column in a row
const detectEmailColumn = (row) => {
  for (const [key, value] of Object.entries(row)) {
    if (emailRegex.test(value?.trim())) {
      return key; // Return the column name containing the email
    }
  }
  return null; // No email column found
};

// Function to send individual emails
const sendEmail = async (req, res) => {
  const { to, subject, message } = req.body;

  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text: message });
    await EmailLog.create({ recipient: to, subject, message, status: 'sent' });
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Email sending failed', error: error.message });
  }
};

// Function to send bulk emails from CSV file
const sendBulkEmailsFromCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'CSV file is required' });
  }

  // Check file format
  if (req.file.mimetype !== 'text/csv') {
    return res.status(400).json({ message: 'Invalid file format. Only CSV files are allowed.' });
  }

  const { subject, message } = req.body;

  // Validate subject and message
  if (!subject || !message) {
    return res.status(400).json({ message: 'Subject and message are required' });
  }

  const buffer = req.file.buffer; // Use buffer instead of file path
  const emailLogs = [];
  const errorLogs = [];
  let emailColumn = null;

  try {
    let rowNumber = 0;
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    bufferStream
      .pipe(csv())
      .on('data', (row) => {
        rowNumber++;
        if (!emailColumn) {
          emailColumn = detectEmailColumn(row); // Detect email column in the first row
          if (!emailColumn) {
            errorLogs.push({ row: rowNumber, error: 'No email column found in the file.' });
            return;
          }
        }

        const recipient = row[emailColumn]?.trim();
        if (!recipient || !emailRegex.test(recipient)) {
          errorLogs.push({ row: rowNumber, column: emailColumn, error: 'Invalid or missing email address.' });
          return;
        }

        emailLogs.push({ recipient, subject, message, status: 'pending' });
      })
      .on('end', async () => {
        if (errorLogs.length > 0) {
          return res.status(400).json({
            message: 'Errors found in the file.',
            errors: errorLogs,
          });
        }

        console.log('Total emails extracted:', emailLogs.length);

        // Send bulk emails with concurrency limit (5 at a time)
        await async.eachLimit(emailLogs, 5, async (log) => {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: log.recipient,
            subject,
            text: message,
            html: `<p>${message}</p>`,
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log('Email sent to:', log.recipient);
            log.status = 'sent';
          } catch (error) {
            console.error('Email sending failed:', error);
            log.status = 'failed';
            log.error = error.message;
          }
        });

        // Save logs in database
        await EmailLog.insertMany(emailLogs);

        return res.status(200).json({ message: 'Bulk emails sent successfully!', logs: emailLogs });
      });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to process CSV', error: error.message });
  }
};

// Function to send bulk emails from Excel file
const sendBulkEmailsFromExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Excel file is required' });
  }

  // Check file format
  if (
    req.file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
    req.file.mimetype !== 'application/vnd.ms-excel'
  ) {
    return res.status(400).json({ message: 'Invalid file format. Only Excel files are allowed.' });
  }

  const { subject, message } = req.body;

  // Validate subject and message
  if (!subject || !message) {
    return res.status(400).json({ message: 'Subject and message are required' });
  }

  const buffer = req.file.buffer; // Use buffer instead of file path
  const emailLogs = [];
  const errorLogs = [];

  try {
    const workbook = xlsx.read(buffer, { type: 'buffer' }); // Read from buffer
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    let emailColumn = null;

    rows.forEach((row, rowNumber) => {
      if (!emailColumn) {
        emailColumn = detectEmailColumn(row); // Detect email column in the first row
        if (!emailColumn) {
          errorLogs.push({ row: rowNumber + 1, error: 'No email column found in the file.' });
          return;
        }
      }

      const recipient = row[emailColumn]?.trim();
      if (!recipient || !emailRegex.test(recipient)) {
        errorLogs.push({ row: rowNumber + 1, column: emailColumn, error: 'Invalid or missing email address.' });
        return;
      }

      emailLogs.push({ recipient, subject, message, status: 'pending' });
    });

    if (errorLogs.length > 0) {
      return res.status(400).json({
        message: 'Errors found in the file.',
        errors: errorLogs,
      });
    }

    console.log('Total emails extracted:', emailLogs.length);

    // Send bulk emails with concurrency limit (5 at a time)
    await async.eachLimit(emailLogs, 5, async (log) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: log.recipient,
        subject,
        text: message,
        html: `<p>${message}</p>`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent to:', log.recipient);
        log.status = 'sent';
      } catch (error) {
        console.error('Email sending failed:', error);
        log.status = 'failed';
        log.error = error.message;
      }
    });

    // Save logs in database
    await EmailLog.insertMany(emailLogs);

    return res.status(200).json({ message: 'Bulk emails sent successfully!', logs: emailLogs });
  } catch (error) {
    console.error('Error processing file:', error);
    return res.status(500).json({ message: 'Failed to send bulk emails', error: error.message });
  }
};

module.exports = { sendEmail, sendBulkEmailsFromCSV, sendBulkEmailsFromExcel };