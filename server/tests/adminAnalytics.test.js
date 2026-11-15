import test from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import express from 'express';
import adminAnalyticsRoutes from '../routes/adminAnalyticsRoutes.js';
import ContactMessage from '../models/ContactMessage.js';
import Admin from '../models/Admin.js';
import errorHandler from '../middleware/errorMiddleware.js';

process.env.JWT_SECRET = 'test-secret-analytics';
process.env.NODE_ENV = 'test';

const app = express();
app.set('trust proxy', 1);
app.use(express.json());

// Cookie parsing middleware
app.use((req, res, next) => {
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

// Mount actual production analytics router
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use(errorHandler);

const mockAdminId = '60d5ec49f1f2e10015b3c8f8';
const generateValidToken = () => jwt.sign({ id: mockAdminId }, process.env.JWT_SECRET);

// Mock state flags
let mockDataMode = 'populated'; // 'populated' or 'empty'

// Mock Admin Model
Admin.findById = (id) => {
  const queryMock = {
    select: () =>
      Promise.resolve(
        id === mockAdminId
          ? {
              _id: mockAdminId,
              name: 'Admin Test',
              email: 'admin@test.com',
            }
          : null
      ),
    then: (resolve, reject) =>
      Promise.resolve(
        id === mockAdminId
          ? {
              _id: mockAdminId,
              name: 'Admin Test',
              email: 'admin@test.com',
            }
          : null
      ).then(resolve, reject),
  };
  return queryMock;
};

// Mock ContactMessage Model methods
ContactMessage.countDocuments = async (query) => {
  if (mockDataMode === 'empty') return 0;
  if (query && query.status === 'unread') return 3;
  if (query && query.status === 'read') return 5;
  if (query && query.status === 'replied') return 4;
  return 12; // total
};

ContactMessage.aggregate = async () => {
  if (mockDataMode === 'empty') return [];
  return [
    { _id: '2026-11-10', count: 2 },
    { _id: '2026-11-14', count: 4 },
  ];
};

ContactMessage.find = () => {
  const resultList =
    mockDataMode === 'empty'
      ? []
      : [
          {
            _id: '60d5ec49f1f2e10015b3c8f9',
            name: 'Alice Smith',
            email: 'alice@example.com',
            subject: 'Portfolio Inquiry',
            status: 'unread',
            createdAt: new Date(),
          },
        ];
  const queryMock = {
    sort: () => queryMock,
    limit: () => queryMock,
    select: () => Promise.resolve(resultList),
    then: (resolve, reject) => Promise.resolve(resultList).then(resolve, reject),
  };
  return queryMock;
};

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

// 1. Authentication Protection Tests
test('Analytics Auth: Missing JWT returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/admin/analytics/overview`);
  assert.strictEqual(res.status, 401);
});

test('Analytics Auth: Invalid JWT returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/admin/analytics/overview`, {
    headers: { Cookie: 'jwt=invalid.token.string' },
  });
  assert.strictEqual(res.status, 401);
});

// 2. Successful Analytics Overview Tests
test('Analytics Overview: Authenticated request returns 200 and expected overview structure', async () => {
  mockDataMode = 'populated';
  const token = generateValidToken();
  const res = await fetch(`${baseUrl}/api/admin/analytics/overview`, {
    headers: { Cookie: `jwt=${token}` },
  });
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.ok(data.data, 'Response should contain data object');

  // Verify stats
  assert.deepStrictEqual(data.data.stats, {
    total: 12,
    unread: 3,
    read: 5,
    replied: 4,
  });

  // Verify activity arrays
  assert.ok(Array.isArray(data.data.activity7Days));
  assert.ok(Array.isArray(data.data.activity30Days));
  assert.strictEqual(data.data.activity7Days.length, 2);

  // Verify recent messages
  assert.ok(Array.isArray(data.data.recentMessages));
  assert.strictEqual(data.data.recentMessages.length, 1);
  assert.strictEqual(data.data.recentMessages[0].name, 'Alice Smith');
});

// 3. Empty Collection Tests
test('Analytics Overview: Empty collection returns zeros and empty arrays with consistent structure', async () => {
  mockDataMode = 'empty';
  const token = generateValidToken();
  const res = await fetch(`${baseUrl}/api/admin/analytics/overview`, {
    headers: { Cookie: `jwt=${token}` },
  });
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);

  // Verify stats are zero
  assert.deepStrictEqual(data.data.stats, {
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
  });

  // Verify activity arrays are empty
  assert.deepStrictEqual(data.data.activity7Days, []);
  assert.deepStrictEqual(data.data.activity30Days, []);

  // Verify recent messages is empty
  assert.deepStrictEqual(data.data.recentMessages, []);
});
