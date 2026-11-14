import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

// Helper to set cookie options based on environment for cross-site deployment (Vercel + Render)
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction, // true in production (HTTPS)
    sameSite: isProduction ? 'none' : 'lax', // 'none' required for cross-site frontend (Vercel) to backend (Render)
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  };
};

// @desc    Admin login & get token cookie
// @route   POST /api/admin/auth/login
// @access  Public
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim() || !password || !password.trim()) {
      res.status(400);
      throw new Error('Please provide email and password.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find admin by email
    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin || !(await admin.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password.');
    }

    // Generate JWT token
    const token = generateToken(admin._id);

    // Set HTTP-only cookie
    res.cookie('jwt', token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Admin logged in successfully.',
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated admin profile
// @route   GET /api/admin/auth/me
// @access  Private (Protected)
export const getAdminProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        createdAt: req.admin.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin logout / clear cookie
// @route   POST /api/admin/auth/logout
// @access  Public
export const logoutAdmin = async (req, res, next) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('jwt', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};
