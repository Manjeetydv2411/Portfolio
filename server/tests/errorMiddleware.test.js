import test from 'node:test';
import assert from 'node:assert';
import multer from 'multer';
import errorHandler from '../middleware/errorMiddleware.js';

const mockReq = {};
const mockRes = () => {
  const res = {};
  res.statusCode = 200;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

test('Error Middleware: MulterError LIMIT_FILE_SIZE returns 413', () => {
  const err = new multer.MulterError('LIMIT_FILE_SIZE');
  const req = mockReq;
  const res = mockRes();

  errorHandler(err, req, res, () => {});

  assert.strictEqual(res.statusCode, 413);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, 'File size exceeds the maximum allowed limit (5MB).');
});

test('Error Middleware: Other MulterError returns 400', () => {
  const err = new multer.MulterError('LIMIT_UNEXPECTED_FILE');
  const req = mockReq;
  const res = mockRes();

  errorHandler(err, req, res, () => {});

  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.ok(res.body.message.includes('File upload error'));
});

test('Error Middleware: Client error (400-499) preserves status and message', () => {
  const err = new Error('Bad request details');
  const req = mockReq;
  const res = mockRes();
  res.status(400); // Controller sets status before throwing

  errorHandler(err, req, res, () => {});

  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, 'Bad request details');
});

test('Error Middleware: Server error (500+) in production hides sensitive message and stack', () => {
  const oldEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  const err = new Error('Database connection string password leaked');
  const req = mockReq;
  const res = mockRes();

  errorHandler(err, req, res, () => {});

 if (oldEnv === undefined) {
  delete process.env.NODE_ENV;
} else {
  process.env.NODE_ENV = oldEnv;
}

  assert.strictEqual(res.statusCode, 500);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, 'Internal Server Error');
  assert.strictEqual(res.body.stack, undefined);
});

test('Error Middleware: Server error in development exposes message and stack', () => {
  const oldEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';

  const err = new Error('Database timeout');
  const req = mockReq;
  const res = mockRes();

  errorHandler(err, req, res, () => {});

  process.env.NODE_ENV = oldEnv;

  assert.strictEqual(res.statusCode, 500);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, 'Database timeout');
  assert.ok(res.body.stack, 'Stack trace should be included in development');
});
