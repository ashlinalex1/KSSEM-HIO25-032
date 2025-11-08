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

// Configure nodemailer with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Server verification error:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
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
      subject: "📚 Your Child’s Weekly Progress Report",
      text: `Hello from MindStride! Here's how your child performed this week.`,
      html: `
  <div style="font-family: 'Poppins', Arial, sans-serif; padding: 20px; background-color: #f8fafc;">
    <div style="max-width: 650px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #2563eb;">📖 Weekly Student Performance Update</h2>
      </div>

      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Hello <strong>Parent/Guardian</strong>, 👋<br><br>
        We’re delighted to share <strong><em>[Student Name]</em></strong>’s learning progress for this week!
      </p>

      <div style="background-color: #f1f5f9; padding: 15px 20px; border-radius: 10px; margin: 20px 0;">
        <p style="font-size: 15px; color: #111;"><strong>📅 Week:</strong> November 1 – November 7, 2025</p>
        <p style="font-size: 15px; color: #111;"><strong>📘 Subjects Covered:</strong> Mathematics, Science, English</p>
        <p style="font-size: 15px; color: #111;"><strong>⭐ Overall Performance:</strong> Excellent 🌟</p>
      </div>

      <h3 style="color: #2563eb;">Highlights ✨</h3>
      <ul style="padding-left: 20px; font-size: 15px; color: #333; line-height: 1.6;">
        <li>📈 Improved test scores in Mathematics</li>
        <li>🧠 Participated actively in classroom discussions</li>
        <li>📚 Completed all assignments on time</li>
      </ul>

      <div style="background-color: #e0f2fe; padding: 15px 20px; border-radius: 10px; margin-top: 20px;">
        <p style="font-size: 15px; color: #111;"><strong>💡 Teacher’s Note:</strong><br>
          [Student Name] showed great enthusiasm this week! Encouraging continued reading practice at home would be wonderful. 📘💖
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="https://mindstride.ai/parent-dashboard" target="_blank" style="background-color: #2563eb; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 500;">
          View Full Progress Report
        </a>
      </div>

      <p style="margin-top: 40px; font-size: 13px; color: #777; text-align: center; line-height: 1.5;">
        This update is part of our mission to keep parents closely connected to their child’s learning journey. 💙<br>
        — The <strong>MindStride</strong> Team
      </p>

    </div>
  </div>
  `
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


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
