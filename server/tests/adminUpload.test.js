import test from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import express from 'express';
import upload, { validateImageSignature } from '../middleware/uploadMiddleware.js';
import adminUploadRoutes from '../routes/adminUploadRoutes.js';
import errorHandler from '../middleware/errorMiddleware.js';
import Admin from '../models/Admin.js';

const originalJwtSecret = process.env.JWT_SECRET;
const originalNodeEnv = process.env.NODE_ENV;

process.env.JWT_SECRET = 'test-secret-upload';
process.env.NODE_ENV = 'test';

// Tiny PNG fixture for file signature detection
const tinyPngBuffer = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
  0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
  0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
  0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44,
  0xae, 0x42, 0x60, 0x82
]);

// App 1: Test actual exported upload middleware directly
const middlewareApp = express();
middlewareApp.set('trust proxy', 1);
middlewareApp.post(
  '/test-upload',
  upload.single('image'),
  validateImageSignature,
  (req, res) => {
    res.status(200).json({ success: true, filename: req.file ? req.file.originalname : null, mimetype: req.file ? req.file.mimetype : null });
  }
);
middlewareApp.use(errorHandler);

// App 2: Test production admin upload router
const routerApp = express();
routerApp.set('trust proxy', 1);
routerApp.use(express.json());
routerApp.use((req, res, next) => {
  const cookieHeader = req.headers.cookie;
  req.cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const parts = cookie.trim().split('=');
      if (parts.length === 2) {
        req.cookies[parts[0]] = parts[1];
      }
    });
  }
  next();
});
routerApp.use('/api/admin/upload', adminUploadRoutes);
routerApp.use(errorHandler);

let server1, server2;
let base1, base2;
const originalFindById = Admin.findById;

test.before(async () => {
  Admin.findById = (id) => {
    const mockAdminId = '60d5ec49f1f2e10015b3c8f8';
    const queryMock = {
      select: () => Promise.resolve(id === mockAdminId ? { _id: mockAdminId, name: 'Admin', email: 'admin@test.com' } : null),
      then: (resolve, reject) => Promise.resolve(id === mockAdminId ? { _id: mockAdminId, name: 'Admin', email: 'admin@test.com' } : null).then(resolve, reject),
    };
    return queryMock;
  };

  await new Promise((resolve) => {
    server1 = middlewareApp.listen(0, () => {
      base1 = `http://localhost:${server1.address().port}`;
      server2 = routerApp.listen(0, () => {
        base2 = `http://localhost:${server2.address().port}`;
        resolve();
      });
    });
  });
});

test.after(async () => {
  Admin.findById = originalFindById;

  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalJwtSecret;
  }

  if (originalNodeEnv === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = originalNodeEnv;
  }

  await new Promise((resolve) => {
    server1.close(() => {
      server2.close(resolve);
    });
  });
});

// Test Cases 1-6 for Upload Middleware
test('Upload Middleware: Valid PNG with image/png MIME type is accepted', async () => {
  const blob = new Blob([tinyPngBuffer], { type: 'image/png' });
  const form = new FormData();
  form.append('image', blob, 'test.png');

  const res = await fetch(`${base1}/test-upload`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.mimetype, 'image/png');
});

test('Upload Middleware: PNG content declared as image/jpeg is rejected with HTTP 400', async () => {
  const blob = new Blob([tinyPngBuffer], { type: 'image/jpeg' });
  const form = new FormData();
  form.append('image', blob, 'test.jpg');

  const res = await fetch(`${base1}/test-upload`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json();

  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.success, false);
});

test('Upload Middleware: Unsupported MIME type text/plain is rejected with HTTP 400', async () => {
  const blob = new Blob([Buffer.from('hello plain text')], { type: 'text/plain' });
  const form = new FormData();
  form.append('image', blob, 'test.txt');

  const res = await fetch(`${base1}/test-upload`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json();

  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.success, false);
});

test('Upload Middleware: Unrecognized signature declared as image/png is rejected with HTTP 400', async () => {
  const blob = new Blob([Buffer.from('not an image signature')], { type: 'image/png' });
  const form = new FormData();
  form.append('image', blob, 'test.png');

  const res = await fetch(`${base1}/test-upload`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json();

  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.success, false);
});

test('Upload Middleware: File larger than 5 MB is rejected with HTTP 413', async () => {
  const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1);
  const blob = new Blob([largeBuffer], { type: 'image/png' });
  const form = new FormData();
  form.append('image', blob, 'large.png');

  const res = await fetch(`${base1}/test-upload`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json();

  assert.strictEqual(res.status, 413);
  assert.strictEqual(data.success, false);
});

test('Upload Middleware: Request without a file passes through without crashing', async () => {
  const form = new FormData();
  // No file appended

  const res = await fetch(`${base1}/test-upload`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
});

// Test Cases for Production Admin Upload Router
test('Production Router: Unauthenticated upload request returns HTTP 401', async () => {
  const form = new FormData();
  const res = await fetch(`${base2}/api/admin/upload`, {
    method: 'POST',
    body: form,
  });
  assert.strictEqual(res.status, 401);
});

test('Production Router: Authenticated request without file returns HTTP 400 with expected message', async () => {
  const mockAdminId = '60d5ec49f1f2e10015b3c8f8';
  const token = jwt.sign({ id: mockAdminId }, process.env.JWT_SECRET);
  const form = new FormData();

  const res = await fetch(`${base2}/api/admin/upload`, {
    method: 'POST',
    headers: {
      Cookie: `jwt=${token}`,
    },
    body: form,
  });
  const data = await res.json();

  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.success, false);
  assert.strictEqual(data.message, 'Please upload an image file.');
});
