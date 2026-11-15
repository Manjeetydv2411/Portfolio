import test from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import express from 'express';
import adminAuthRoutes from '../routes/adminAuthRoutes.js';
import Admin from '../models/Admin.js';
import errorHandler from '../middleware/errorMiddleware.js';

// Setup Mock Environment
process.env.JWT_SECRET = 'test-secret-auth';
process.env.NODE_ENV = 'test';

// Setup Express App for testing routes
const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Middleware to simulate cookie parsing
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

// Mount actual production admin auth router
app.use('/api/admin/auth', adminAuthRoutes);
app.use(errorHandler);

// Mock Data & State
const mockAdminId = '60d5ec49f1f2e10015b3c8f8';
const mockAdminEmail = 'admin@test.com';
const mockAdminPassword = 'securepassword123';

// Mock Admin Model
Admin.findOne = (query) => {
  if (query.email === mockAdminEmail) {
    return Promise.resolve({
      _id: mockAdminId,
      name: 'Admin Test',
      email: mockAdminEmail,
      createdAt: new Date(),
      matchPassword: async (password) => password === mockAdminPassword,
    });
  }
  return Promise.resolve(null);
};

Admin.findById = (id) => {
  const queryMock = {
    select: () =>
      Promise.resolve(
        id === mockAdminId
          ? {
              _id: mockAdminId,
              name: 'Admin Test',
              email: mockAdminEmail,
              createdAt: new Date(),
            }
          : null
      ),
    then: (resolve, reject) =>
      Promise.resolve(
        id === mockAdminId
          ? {
              _id: mockAdminId,
              name: 'Admin Test',
              email: mockAdminEmail,
              createdAt: new Date(),
            }
          : null
      ).then(resolve, reject),
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

// 1. Login Tests
test('Auth Login: Successful login returns 200, sets JWT cookie, and issues valid JWT', async () => {
  const res = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': '203.0.113.10',
    },
    body: JSON.stringify({ email: mockAdminEmail, password: mockAdminPassword }),
  });
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.data.email, mockAdminEmail);

  // Verify Set-Cookie header contains jwt token
  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie, 'Set-Cookie header should be present');
  assert.ok(setCookie.includes('jwt='), 'Cookie should contain jwt');
  assert.ok(setCookie.includes('HttpOnly'), 'Cookie should be HttpOnly');

  // Extract jwt value and verify against test secret
  const match = setCookie.match(/jwt=([^;]+)/);
  assert.ok(match, 'JWT token found in cookie string');
  const token = match[1];

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  assert.strictEqual(decoded.id, mockAdminId);
});

test('Auth Login: Missing email or password returns 400', async () => {
  const res = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': '203.0.113.11',
    },
    body: JSON.stringify({ email: '', password: '' }),
  });
  const data = await res.json();

  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.success, false);
  assert.strictEqual(data.message, 'Please provide email and password.');
});

test('Auth Login: Unknown admin email returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': '203.0.113.12',
    },
    body: JSON.stringify({ email: 'unknown@test.com', password: mockAdminPassword }),
  });
  const data = await res.json();

  assert.strictEqual(res.status, 401);
  assert.strictEqual(data.success, false);
  assert.strictEqual(data.message, 'Invalid email or password.');
});

test('Auth Login: Incorrect password returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': '203.0.113.13',
    },
    body: JSON.stringify({ email: mockAdminEmail, password: 'wrongpassword' }),
  });
  const data = await res.json();

  assert.strictEqual(res.status, 401);
  assert.strictEqual(data.success, false);
  assert.strictEqual(data.message, 'Invalid email or password.');
});

// 2. Admin Profile Tests
test('Auth Profile: Authenticated request to GET /api/admin/auth/me succeeds (200)', async () => {
  const token = jwt.sign({ id: mockAdminId }, process.env.JWT_SECRET);
  const res = await fetch(`${baseUrl}/api/admin/auth/me`, {
    headers: {
      Cookie: `jwt=${token}`,
      'X-Forwarded-For': '203.0.113.14',
    },
  });
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.data.email, mockAdminEmail);
});

test('Auth Profile: Missing token returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/admin/auth/me`, {
    headers: {
      'X-Forwarded-For': '203.0.113.15',
    },
  });
  assert.strictEqual(res.status, 401);
});

test('Auth Profile: Invalid or expired token returns 401', async () => {
  const expiredToken = jwt.sign({ id: mockAdminId }, process.env.JWT_SECRET, { expiresIn: '-1s' });
  const res = await fetch(`${baseUrl}/api/admin/auth/me`, {
    headers: {
      Cookie: `jwt=${expiredToken}`,
      'X-Forwarded-For': '203.0.113.16',
    },
  });
  assert.strictEqual(res.status, 401);
});

// 3. Logout Tests
test('Auth Logout: POST /api/admin/auth/logout clears the JWT cookie', async () => {
  const res = await fetch(`${baseUrl}/api/admin/auth/logout`, {
    method: 'POST',
    headers: {
      'X-Forwarded-For': '203.0.113.17',
    },
  });
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);

  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie, 'Set-Cookie header should be present on logout');
  assert.ok(setCookie.includes('jwt='), 'Cookie should reference jwt');
  assert.ok(setCookie.includes('HttpOnly'), 'Cookie should be HttpOnly');
  assert.ok(
    setCookie.includes('Expires=Thu, 01 Jan 1970') || setCookie.includes('expires=Thu, 01 Jan 1970'),
    'Cookie expiration should be set to epoch 0'
  );
});

// 4. Login Rate Limiter Tests
test('Auth Rate Limiter: Allows 10 login attempts and rejects 11th with 429', async () => {
  const rateLimitIp = '198.51.100.99';

  // Make 10 attempts (allowed)
  for (let i = 0; i < 10; i++) {
    const res = await fetch(`${baseUrl}/api/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': rateLimitIp,
      },
      body: JSON.stringify({ email: mockAdminEmail, password: 'wrongpassword' }),
    });
    // Will return 401 for incorrect password, which is allowed by rate limiter
    assert.strictEqual(res.status, 401);
  }

  // 11th attempt from same IP should hit rate limiter (429)
  const res11 = await fetch(`${baseUrl}/api/admin/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': rateLimitIp,
    },
    body: JSON.stringify({ email: mockAdminEmail, password: mockAdminPassword }),
  });
  const data11 = await res11.json();

  assert.strictEqual(res11.status, 429);
  assert.strictEqual(data11.success, false);
  assert.strictEqual(data11.message, 'Too many login attempts from this IP, please try again after 15 minutes.');
});
