import nodemailer from 'nodemailer';

// Create a reusable transporter object using SMTP transport
const createTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT) || 465;
  const secure = process.env.EMAIL_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

/**
 * Send contact form submission notification email to portfolio owner
 * @param {Object} contactData
 * @param {string} contactData.name
 * @param {string} contactData.email
 * @param {string} contactData.subject
 * @param {string} contactData.message
 * @param {Date} contactData.createdAt
 */
export const sendContactNotification = async ({ name, email, subject, message, createdAt }) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;
  const receiver = process.env.CONTACT_RECEIVER_EMAIL || user;

  if (!user || !pass) {
    console.warn('Email credentials (EMAIL_USER / EMAIL_APP_PASSWORD) are not configured. Skipping email notification.');
    return { success: false, reason: 'Email not configured' };
  }

  const transport = getTransporter();

  const mailOptions = {
    from: `"Portfolio Contact System" <${user}>`,
    to: receiver,
    replyTo: email,
    subject: `[Portfolio Inquiry] ${subject}`,
    text: `You have received a new message from your portfolio contact form.

--------------------------------------------------
SENDER DETAILS:
--------------------------------------------------
Name:    ${name}
Email:   ${email}
Subject: ${subject}
Time:    ${new Date(createdAt).toLocaleString()}

--------------------------------------------------
MESSAGE:
--------------------------------------------------
${message}

--------------------------------------------------
You can reply directly to this email to respond to ${name}.
`,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.log(`Contact notification email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send contact notification email:', error.message);
    throw error;
  }
};
