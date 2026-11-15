import test from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import express from 'express';
import adminContactRoutes from '../routes/adminContactRoutes.js';
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

// Mount actual production router (applies protectAdmin middleware automatically)
app.use('/api/admin/messages', adminContactRoutes);

// Error handler preserving status code set on response
app.use((err, req, res, next) => {
  const status = res.statusCode >= 400 ? res.statusCode : (err.status || 500);
  res.status(status).json({ success: false, message: err.message });
});

// Mock IDs & State trackers
const mockAdminId = '60d5ec49f1f2e10015b3c8f8';
const mockMessageId = '60d5ec49f1f2e10015b3c8f9';
const nonExistentMessageId = '60d5ec49f1f2e10015b3c8fa';

let lastQuery = null;
let lastCountQuery = null;
let savedMessageStatus = null;
let messageDeleted = false;

// Mock ContactMessage Model with query introspection and chainable query mocks
ContactMessage.countDocuments = (q) => {
  lastCountQuery = q;
  return Promise.resolve(15); // Total count for pagination testing
};

ContactMessage.find = (q) => {
  lastQuery = q;
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
    skip: (skipVal) => {
      queryMock.skipVal = skipVal;
      return queryMock;
    },
    limit: (limitVal) => {
      queryMock.limitVal = limitVal;
      return Promise.resolve(resultList);
    },
    select: () => Promise.resolve(resultList),
    then: (resolve, reject) => Promise.resolve(resultList).then(resolve, reject),
  };
  return queryMock;
};

ContactMessage.findById = (id) => {
  const exists = id === mockMessageId;
  const mockMsg = exists ? {
    _id: mockMessageId,
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Subject',
    message: 'Test Message',
    status: 'unread',
    createdAt: new Date(),
    save: function() {
      savedMessageStatus = this.status;
      return Promise.resolve(this);
    },
    deleteOne: function() {
      messageDeleted = true;
      return Promise.resolve(this);
    }
  } : null;

  const queryMock = {
    select: () => Promise.resolve(mockMsg),
    then: (resolve, reject) => Promise.resolve(mockMsg).then(resolve, reject),
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

const generateValidToken = () => jwt.sign({ id: mockAdminId }, process.env.JWT_SECRET);
const generateExpiredToken = () => jwt.sign({ id: mockAdminId }, process.env.JWT_SECRET, { expiresIn: '-1s' });

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

// 1. Authentication Tests
test('Auth: Unauthenticated access rejected (401)', async () => {
  const res = await fetch(`${baseUrl}/api/admin/messages`);
  assert.strictEqual(res.status, 401);
});

test('Auth: Malformed JWT rejected (401)', async () => {
  const res = await fetch(`${baseUrl}/api/admin/messages`, {
    headers: { Cookie: 'jwt=malformed.jwt.token' }
  });
  assert.strictEqual(res.status, 401);
});

test('Auth: Expired JWT rejected (401)', async () => {
  const expiredToken = generateExpiredToken();
  const res = await fetch(`${baseUrl}/api/admin/messages`, {
    headers: { Cookie: `jwt=${expiredToken}` }
  });
  assert.strictEqual(res.status, 401);
});

test('Auth: Valid admin access (200)', async () => {
  const token = generateValidToken();
  const res = await fetch(`${baseUrl}/api/admin/messages`, {
    headers: { Cookie: `jwt=${token}` },
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(Array.isArray(data.data), true);
});

// 2. Pagination Tests
test('Pagination: Verify page, limit, skip calculation, and metadata (200)', async () => {
  const token = generateValidToken();
  const res = await fetch(`${baseUrl}/api/admin/messages?page=2&limit=5`, {
    headers: { Cookie: `jwt=${token}` },
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.deepStrictEqual(data.pagination, {
    total: 15,
    page: 2,
    pages: 3, // Math.ceil(15 / 5)
    limit: 5,
  });
});

// 3. Search Tests
test('Search: Verify search query construction and regex escaping for name, email, subject (200)', async () => {
  const token = generateValidToken();
  lastQuery = null;
  const searchTerm = 'alice.smith(test)';
  const res = await fetch(`${baseUrl}/api/admin/messages?search=${encodeURIComponent(searchTerm)}`, {
    headers: { Cookie: `jwt=${token}` },
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(lastQuery, 'Query object should be passed to ContactMessage.find');
  assert.ok(lastQuery.$or, 'Query should contain $or for multi-field search');
  assert.strictEqual(lastQuery.$or.length, 3);
  // Verify regex special characters like parentheses and dots are escaped properly in the source
  const expectedEscapedRegex = 'alice\\.smith\\(test\\)';
  assert.strictEqual(lastQuery.$or[0].name.source, expectedEscapedRegex);
  assert.strictEqual(lastQuery.$or[1].email.source, expectedEscapedRegex);
  assert.strictEqual(lastQuery.$or[2].subject.source, expectedEscapedRegex);
});

// 4. Status Filtering Tests
test('Status Filtering: Verify valid status filters (unread, read, replied) (200)', async () => {
  const token = generateValidToken();

  for (const status of ['unread', 'read', 'replied']) {
    lastQuery = null;
    const res = await fetch(`${baseUrl}/api/admin/messages?status=${status}`, {
      headers: { Cookie: `jwt=${token}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(lastQuery.status, status);
  }
});

test('Status Filtering: Verify invalid status query parameter is ignored by controller (200)', async () => {
  const token = generateValidToken();
  lastQuery = null;
  const res = await fetch(`${baseUrl}/api/admin/messages?status=malicious_status`, {
    headers: { Cookie: `jwt=${token}` },
  });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(lastQuery.status, undefined);
});

// 5. Message ID and Not Found Tests
test('Message ID: Invalid message ID format returns 400', async () => {
  const token = generateValidToken();
  const res = await fetch(`${baseUrl}/api/admin/messages/not-an-object-id`, {
    headers: { Cookie: `jwt=${token}` },
  });
  assert.strictEqual(res.status, 400);
});

test('Not Found: GET non-existent valid message ID returns 404', async () => {
  const token = generateValidToken();
  const res = await fetch(`${baseUrl}/api/admin/messages/${nonExistentMessageId}`, {
    headers: { Cookie: `jwt=${token}` },
  });
  const data = await res.json();
  assert.strictEqual(res.status, 404);
  assert.strictEqual(data.success, false);
  assert.strictEqual(data.message, 'Contact message not found.');
});

test('Not Found: PATCH status for non-existent valid message ID returns 404', async () => {
  const token = generateValidToken();
  const res = await fetch(`${baseUrl}/api/admin/messages/${nonExistentMessageId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `jwt=${token}`,
    },
    body: JSON.stringify({ status: 'read' }),
  });
  const data = await res.json();
  assert.strictEqual(res.status, 404);
  assert.strictEqual(data.success, false);
  assert.strictEqual(data.message, 'Contact message not found.');
});

test('Not Found: DELETE non-existent valid message ID returns 404', async () => {
  const token = generateValidToken();
  const res = await fetch(`${baseUrl}/api/admin/messages/${nonExistentMessageId}`, {
    method: 'DELETE',
    headers: { Cookie: `jwt=${token}` },
  });
  const data = await res.json();
  assert.strictEqual(res.status, 404);
  assert.strictEqual(data.success, false);
  assert.strictEqual(data.message, 'Contact message not found.');
});

// 6. Update Status & Delete Actions (Behavioral verification)
test('Actions: Update message status successfully (200)', async () => {
  const token = generateValidToken();
  savedMessageStatus = null;
  const res = await fetch(`${baseUrl}/api/admin/messages/${mockMessageId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `jwt=${token}`,
    },
    body: JSON.stringify({ status: 'replied' }),
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(savedMessageStatus, 'replied');
});

test('Actions: Invalid status value rejected with 400', async () => {
  const token = generateValidToken();
  const res = await fetch(`${baseUrl}/api/admin/messages/${mockMessageId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `jwt=${token}`,
    },
    body: JSON.stringify({ status: 'unknown_status' }),
  });
  assert.strictEqual(res.status, 400);
});

test('Actions: Delete message successfully (200)', async () => {
  const token = generateValidToken();
  messageDeleted = false;
  const res = await fetch(`${baseUrl}/api/admin/messages/${mockMessageId}`, {
    method: 'DELETE',
    headers: { Cookie: `jwt=${token}` },
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(messageDeleted, true);
});
