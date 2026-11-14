import ContactMessage from '../models/ContactMessage.js';
import { sendContactNotification } from '../services/emailService.js';

// @desc    Submit a new contact message
// @route   POST /api/contact
// @access  Public
export const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Check for missing fields
    if (!name || !name.trim() || !email || !email.trim() || !subject || !subject.trim() || !message || !message.trim()) {
      res.status(400);
      throw new Error('Please fill in all required fields.');
    }

    // Length validation
    if (name.trim().length > 100) {
      res.status(400);
      throw new Error('Name cannot exceed 100 characters.');
    }
    if (email.trim().length > 255) {
      res.status(400);
      throw new Error('Email cannot exceed 255 characters.');
    }
    if (subject.trim().length > 200) {
      res.status(400);
      throw new Error('Subject cannot exceed 200 characters.');
    }
    if (message.trim().length > 5000) {
      res.status(400);
      throw new Error('Message cannot exceed 5000 characters.');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      res.status(400);
      throw new Error('Please enter a valid email address.');
    }

    // 1. Save message to database first
    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    // 2. Attempt to send email notification (non-blocking for DB persistence)
    try {
      await sendContactNotification({
        name: contactMessage.name,
        email: contactMessage.email,
        subject: contactMessage.subject,
        message: contactMessage.message,
        createdAt: contactMessage.createdAt,
      });
    } catch (emailError) {
      // Log error safely without failing the request or losing the saved message
      console.warn('Warning: Contact message saved to database, but email notification failed to send:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Message saved successfully. Thank you for reaching out!',
      data: {
        id: contactMessage._id,
        name: contactMessage.name,
        email: contactMessage.email,
        subject: contactMessage.subject,
        createdAt: contactMessage.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
