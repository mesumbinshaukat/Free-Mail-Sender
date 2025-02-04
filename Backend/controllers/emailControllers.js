// controllers/emailController.js
const nodemailer = require('nodemailer');
const async = require('async');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const moment = require('moment');
const EmailLog = require('../models/EmailLog');

// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: process.env.HOST_NAME, // Use your SMTP provider or customize
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send individual emails
const sendEmail = async (req, res) => {
  const { to, subject, text, html } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);

    // Log email details in MongoDB
    await EmailLog.create({
      recipient: to,
      subject,
      message: text,
      status: 'sent',
    });

    return res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    await EmailLog.create({
      recipient: to,
      subject,
      message: text,
      status: 'failed',
      error: error.message,
    });

    return res.status(500).json({ message: 'Email sending failed', error: error.message });
  }
};

// Function to send bulk emails from CSV file
const sendBulkEmailsFromCSV = async (req, res) => {
  const { filePath } = req.body;

  const emailLogs = [];

  try {
    const recipients = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        recipients.push(row.email); // Assuming the CSV has an 'email' column
      })
      .on('end', async () => {
        // Send bulk emails with concurrency
        async.eachLimit(recipients, 5, async (recipient) => {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipient,
            subject: 'Your Bulk Email Subject',
            text: 'Bulk email message body.',
            html: '<p>Bulk email message body.</p>',
          };

          try {
            await transporter.sendMail(mailOptions);

            // Log success in database
            emailLogs.push({ recipient, status: 'sent' });
          } catch (error) {
            // Log failure in database
            emailLogs.push({ recipient, status: 'failed', error: error.message });
          }
        });

        // Save logs in database
        for (const log of emailLogs) {
          await EmailLog.create(log);
        }

        return res.status(200).json({ message: 'Bulk emails sent successfully!' });
      });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send bulk emails', error: error.message });
  }
};

// Function to send bulk emails from Excel file
const sendBulkEmailsFromExcel = async (req, res) => {
  const { filePath } = req.body;

  const emailLogs = [];

  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const recipients = xlsx.utils.sheet_to_json(sheet);

    async.eachLimit(recipients, 5, async (row) => {
      const recipient = row.email; // Assuming 'email' is a column in the sheet

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipient,
        subject: 'Your Bulk Email Subject',
        text: 'Bulk email message body.',
        html: '<p>Bulk email message body.</p>',
      };

      try {
        await transporter.sendMail(mailOptions);

        // Log success in database
        emailLogs.push({ recipient, status: 'sent' });
      } catch (error) {
        // Log failure in database
        emailLogs.push({ recipient, status: 'failed', error: error.message });
      }
    });

    // Save logs in database
    for (const log of emailLogs) {
      await EmailLog.create(log);
    }

    return res.status(200).json({ message: 'Bulk emails sent successfully!' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send bulk emails', error: error.message });
  }
};

module.exports = { sendEmail, sendBulkEmailsFromCSV, sendBulkEmailsFromExcel };
