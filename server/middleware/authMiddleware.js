import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const protectAdmin = async (req, res, next) => {
  try {
    let token;

    // Check JWT in HTTP-only cookies first
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    // Fallback to Authorization Bearer token header if needed
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401);
      throw new Error('Not authorized, token missing');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find admin by id from decoded token (never trust frontend supplied ID)
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      res.status(401);
      throw new Error('Not authorized, admin user not found');
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401);
      return next(new Error('Session expired, please log in again'));
    }
    if (error.name === 'JsonWebTokenError') {
      res.status(401);
      return next(new Error('Invalid token, authorization failed'));
    }
    next(error);
  }
};
