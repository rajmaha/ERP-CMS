const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = (smtpSettings = null) => {
  const config = smtpSettings || {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  };

  return nodemailer.createTransporter(config);
};

// Send email function
const sendEmail = async (options, smtpSettings = null) => {
  const transporter = createTransporter(smtpSettings);

  const fromEmail = smtpSettings?.fromEmail || process.env.SMTP_FROM_EMAIL;
  const fromName = smtpSettings?.fromName || process.env.SMTP_FROM_NAME;

  const mailOptions = {
    from: options.from || `${fromName} <${fromEmail}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Test SMTP connection
const testSmtpConnection = async (smtpSettings) => {
  try {
    const transporter = createTransporter(smtpSettings);
    await transporter.verify();
    return { success: true, message: 'SMTP connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = {
  sendEmail,
  testSmtpConnection
};
