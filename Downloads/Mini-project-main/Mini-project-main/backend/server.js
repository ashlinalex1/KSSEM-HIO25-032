import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// // Email sending endpoint
// app.post('/api/email', async (req, res) => {
//   try {
//     const { recipient, subject, message } = req.body;
    
//     // Create transporter
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASSWORD
//       }
//     });
    
//     // Configure email options
//     const mailOptions = {
//       from: process.env.SMTP_USER,
//       to: recipient,
//       subject: subject,
//       text: message
//     };
    
//     // Send email
//     await transporter.sendMail(mailOptions);
    
//     res.status(200).json({ success: true, message: 'Email sent successfully' });
//   } catch (error) {
//     console.error('Email sending error:', error);
//     res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
//   }
// });

// Configure nodemailer transporter
// Enable detailed nodemailer debug logging
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: false, // Always false for port 587 (TLS/STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  logger: true,
  debug: true,
});

// Route to send email
app.post('/api/email', async (req, res) => {
  try {
    const { recipient_email } = req.body;

    if (!recipient_email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: recipient_email' 
      });
    }

    // Email options
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: recipient_email,
      subject: 'Job Opportunities',
      text: `Job Opportunities`,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
              <h2 style="color: #d9534f;">Job Opportunities</h2>
              <p>Job Opportunities</p>
              <p style="margin-top: 20px; font-size: 12px; color: #777;">
                This is an automated message from Resonate.
              </p>
            </div>`,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Email sent successful',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
