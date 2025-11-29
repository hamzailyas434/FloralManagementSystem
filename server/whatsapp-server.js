const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for Angular app
app.use(cors());
app.use(express.json());

// Twilio credentials - Use environment variables for security
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'YOUR_ACCOUNT_SID_HERE';
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'YOUR_AUTH_TOKEN_HERE';
const TWILIO_WHATSAPP_NUMBER = 'whatsapp:+14155238886';

/**
 * Send WhatsApp message endpoint
 */
app.post('/api/send-whatsapp', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, message'
      });
    }

    console.log('📱 Sending WhatsApp...');
    console.log('To:', to);
    console.log('Message:', message);

    // Twilio API endpoint
    const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`;
    
    // Create form data
    const params = new URLSearchParams();
    params.append('From', TWILIO_WHATSAPP_NUMBER);
    params.append('To', to);
    params.append('Body', message);

    // Send request to Twilio
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ WhatsApp sent successfully!');
      console.log('Message SID:', result.sid);
      console.log('Status:', result.status);
      
      res.json({
        success: true,
        messageSid: result.sid,
        status: result.status
      });
    } else {
      console.error('❌ Twilio error:', result);
      res.status(response.status).json({
        success: false,
        error: result.message || 'Failed to send WhatsApp'
      });
    }
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'WhatsApp API server is running' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp API server running on port ${PORT}`);
  console.log(`📱 Ready to send WhatsApp messages!`);
  console.log(`\nEndpoints:`);
  console.log(`  POST http://localhost:${PORT}/api/send-whatsapp`);
  console.log(`  GET  http://localhost:${PORT}/api/health`);
});
