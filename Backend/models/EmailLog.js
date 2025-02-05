// models/EmailLog.js
const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  recipient: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['sent', 'failed'], required: true },
  sentAt: { type: Date, default: Date.now },
  error: { type: String, default: null },
});

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

module.exports = EmailLog;
