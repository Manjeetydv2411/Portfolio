import mongoose from 'mongoose';
import ContactMessage from '../models/ContactMessage.js';

// Helper to escape regex special characters for safe search input
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// @desc    Get all contact messages (with pagination, status filter, search)
// @route   GET /api/admin/messages
// @access  Private (Admin)
export const getMessages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status;
    const search = req.query.search;

    const query = {};

    // Filter by status if valid
    if (status && ['unread', 'read', 'replied'].includes(status)) {
      query.status = status;
    }

    // Search by name, email, or subject with sanitized regex
    if (search && search.trim() !== '') {
      const sanitizedSearch = escapeRegExp(search.trim());
      const searchRegex = new RegExp(sanitizedSearch, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
      ];
    }

    const startIndex = (page - 1) * limit;
    const total = await ContactMessage.countDocuments(query);

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: messages.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        limit,
      },
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single contact message by ID
// @route   GET /api/admin/messages/:id
// @access  Private (Admin)
export const getMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid message ID format.');
    }

    const message = await ContactMessage.findById(id);

    if (!message) {
      res.status(404);
      throw new Error('Contact message not found.');
    }

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact message status
// @route   PATCH /api/admin/messages/:id/status
// @access  Private (Admin)
export const updateMessageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid message ID format.');
    }

    if (!status || !['unread', 'read', 'replied'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status. Allowed values: unread, read, replied.');
    }

    const message = await ContactMessage.findById(id);

    if (!message) {
      res.status(404);
      throw new Error('Contact message not found.');
    }

    message.status = status;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message status updated successfully.',
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact message
// @route   DELETE /api/admin/messages/:id
// @access  Private (Admin)
export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid message ID format.');
    }

    const message = await ContactMessage.findById(id);

    if (!message) {
      res.status(404);
      throw new Error('Contact message not found.');
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully.',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};
