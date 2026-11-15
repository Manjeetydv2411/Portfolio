import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';

// Use memory storage so file buffer is available for Cloudinary stream
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
  fileFilter,
});

// Middleware to check file signature and content type match after multer parses the buffer
export const validateImageSignature = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const detectedType = await fileTypeFromBuffer(req.file.buffer);
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!detectedType || !allowedMimeTypes.includes(detectedType.mime)) {
      const error = new Error('Invalid file type or unsupported file signature.');
      error.statusCode = 400;
      return next(error);
    }

    if (detectedType.mime !== req.file.mimetype) {
      const error = new Error('File content type mismatch. Declared MIME type does not match detected file signature.');
      error.statusCode = 400;
      return next(error);
    }

    next();
  } catch (err) {
       next(err);
  }
};

export default upload;
