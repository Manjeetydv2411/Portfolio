import test from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import express from 'express';
import mongoose from 'mongoose';
import { protectAdmin } from '../middleware/authMiddleware.js';
import {
  getMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage,
} from '../controllers/adminContactController.js';
import ContactMessage from '../models/ContactMessage.js';
import Admin from '../models/Admin.js';

// Setup Mock Environment
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

// Setup Express App for testing routes
const app = express();
app.use(express.json());
// Middleware to simulate cookie parsing
app.use((req, res, next) => {
  const cookieHeader = req.headers.cookie;
  req.cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.trim().split('=');
      if (parts.length === 2) {
        req.cookies[parts[0]] = parts[1];
      }
    });
  }
  next();
});

// Setup Test Router
const router = express.Router();
router.use(protectAdmin);
router.route('/').get(getMessages);
router.route('/:id').get(getMessageById);
router.route('/:id/status').patch(updateMessageStatus);
router.route('/:id').delete(deleteMessage);
app.use('/api/admin/messages', router);

// Error handler preserving status code set on response
app.use((err, req, res, next) => {
  const status = res.statusCode >= 400 ? res.statusCode : (err.status || 500);
  res.status(status).json({ success: false, message: err.message });
});

// Mock IDs
const mockAdminId = '60d5ec49f1f2e10015b3c8f8';
const mockMessageId = '60d5ec49f1f2e10015b3c8f9';

// Mock ContactMessage Model with chainable query mocks
ContactMessage.countDocuments = () => Promise.resolve(1);
ContactMessage.find = (query) => {
  const resultList = [{
    _id: mockMessageId,
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Subject',
    message: 'Test Message',
    status: 'unread',
    createdAt: new Date()
  }];
  const queryMock = {
    sort: () => queryMock,
    skip: () => queryMock,
    limit: () => Promise.resolve(resultList),
    select: () => Promise.resolve(resultList),
    then: (resolve, reject) => Promise.resolve(resultList).then(resolve, reject),
  };
  return queryMock;
};

ContactMessage.findById = (id) => {
  const queryMock = {
    select: () => Promise.resolve(id === mockMessageId ? {
      _id: mockMessageId,
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'Test Message',
      status: 'unread',
      createdAt: new Date(),
      save: () => Promise.resolve(),
      deleteOne: () => Promise.resolve()
    } : null),
    then: (resolve, reject) => Promise.resolve(id === mockMessageId ? {
      _id: mockMessageId,
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'Test Message',
      status: 'unread',
      createdAt: new Date(),
      save: () => Promise.resolve(),
      deleteOne: () => Promise.resolve()
    } : null).then(resolve, reject),
  };
  return queryMock;
};

// Mock Admin Model with chainable query mocks
Admin.findById = (id) => {
  const queryMock = {
    select: () => Promise.resolve(id === mockAdminId ? {
      _id: mockAdminId,
      name: 'Admin',
      email: 'admin@test.com'
    } : null),
    then: (resolve, reject) => Promise.resolve(id === mockAdminId ? {
      _id: mockAdminId,
      name: 'Admin',
      email: 'admin@test.com'
    } : null).then(resolve, reject),
  };
  return queryMock;
};

const generateTestToken = () => jwt.sign({ id: mockAdminId }, process.env.JWT_SECRET);

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

test('Admin Contact API: Unauthenticated access rejected (401)', async () => {
  const res = await fetch(`${baseUrl}/api/admin/messages`);
  assert.strictEqual(res.status, 401);
});

test('Admin Contact API: Valid admin access and listing (200)', async () => {
  const token = generateTestToken();
  const res = await fetch(`${baseUrl}/api/admin/messages`, {
    headers: {
      Cookie: `jwt=${token}`,
    },
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(Array.isArray(data.data), true);
});

test('Admin Contact API: Get message by ID (200)', async () => {
  const token = generateTestToken();
  const res = await fetch(`${baseUrl}/api/admin/messages/${mockMessageId}`, {
    headers: {
      Cookie: `jwt=${token}`,
    },
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.data._id, mockMessageId);
});

test('Admin Contact API: Invalid message ID handling (400)', async () => {
  const token = generateTestToken();
  const res = await fetch(`${baseUrl}/api/admin/messages/invalid-id-format`, {
    headers: {
      Cookie: `jwt=${token}`,
    },
  });
  assert.strictEqual(res.status, 400);
});

test('Admin Contact API: Update message status (200)', async () => {
  const token = generateTestToken();
  const res = await fetch(`${baseUrl}/api/admin/messages/${mockMessageId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `jwt=${token}`,
    },
    body: JSON.stringify({ status: 'read' }),
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
});

test('Admin Contact API: Invalid status rejection (400)', async () => {
  const token = generateTestToken();
  const res = await fetch(`${baseUrl}/api/admin/messages/${mockMessageId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `jwt=${token}`,
    },
    body: JSON.stringify({ status: 'invalid-status' }),
  });
  assert.strictEqual(res.status, 400);
});

test('Admin Contact API: Delete message (200)', async () => {
  const token = generateTestToken();
  const res = await fetch(`${baseUrl}/api/admin/messages/${mockMessageId}`, {
    method: 'DELETE',
    headers: {
      Cookie: `jwt=${token}`,
    },
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
});
