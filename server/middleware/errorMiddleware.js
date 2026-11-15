import multer from 'multer';

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle Multer errors explicitly
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      statusCode = 413;
      message = 'File size exceeds the maximum allowed limit (5MB).';
    } else {
      statusCode = 400;
      message = `File upload error: ${err.message}`;
    }
  } else {
    // Preserve intentional client error status codes (400-499)
    if (err.statusCode >= 400 && err.statusCode < 500) {
      statusCode = err.statusCode;
    } else if (err.status >= 400 && err.status < 500) {
      statusCode = err.status;
    } else if (statusCode < 400 || statusCode >= 500) {
      statusCode = 500;
    }
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // For unexpected server errors (500+), return a generic message in production
  const responseMessage = statusCode >= 500 && isProduction
    ? 'Internal Server Error'
    : message;

  res.status(statusCode).json({
    success: false,
    message: responseMessage,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export default errorHandler;
