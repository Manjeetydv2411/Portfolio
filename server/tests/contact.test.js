import test from 'node:test';
import assert from 'node:assert';
import express from 'express';
import contactRoutes from '../routes/contactRoutes.js';
import ContactMessage from '../models/ContactMessage.js';
import errorHandler from '../middleware/errorMiddleware.js';

process.env.NODE_ENV = 'test';

const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use('/api/contact', contactRoutes);
app.use(errorHandler);

let server;
let baseUrl;

let lastCreatedData = null;
let shouldFailDb = false;

const originalCreate = ContactMessage.create;

test.before(async () => {
  ContactMessage.create = async (data) => {
    if (shouldFailDb) {
      throw new Error('Database save failed');
    }
    lastCreatedData = data;
    return {
      _id: '60d5ec49f1f2e10015b3c8f9',
      ...data,
      createdAt: new Date(),
    };
  };

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  ContactMessage.create = originalCreate;
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

test('Contact API: Valid submission returns 201 and persists normalized data', async () => {
  lastCreatedData = null;
  shouldFailDb = false;
  const payload = {
    name: '  John Doe  ',
    email: '  JOHN.DOE@EXAMPLE.COM  ',
    subject: '  Test Subject  ',
    message: '  Test Message Content  ',
  };

  const res = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': '203.0.113.1',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  assert.strictEqual(res.status, 201);
  assert.strictEqual(data.success, true);
  assert.strictEqual(lastCreatedData.name, 'John Doe');
  assert.strictEqual(lastCreatedData.email, 'john.doe@example.com');
  assert.strictEqual(lastCreatedData.subject, 'Test Subject');
  assert.strictEqual(lastCreatedData.message, 'Test Message Content');
});

test('Contact API: Missing required fields returns 400', async () => {
  const fields = ['name', 'email', 'subject', 'message'];
  let ipCounter = 10;
  for (const field of fields) {
    const payload = {
      name: 'John',
      email: 'john@example.com',
      subject: 'Subject',
      message: 'Message',
      [field]: '',
    };
    const res = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': `203.0.113.${ipCounter++}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Please fill in all required fields.');
  }
});

test('Contact API: Whitespace-only fields returns 400', async () => {
  const res = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': '203.0.113.20',
    },
    body: JSON.stringify({ name: '   ', email: 'a@b.com', subject: 's', message: 'm' }),
  });
  const data = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.message, 'Please fill in all required fields.');
});

test('Contact API: Invalid email format returns 400', async () => {
  const res = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': '203.0.113.21',
    },
    body: JSON.stringify({ name: 'John', email: 'invalid-email', subject: 'Subject', message: 'Message' }),
  });
  const data = await res.json();
  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.message, 'Please enter a valid email address.');
});

test('Contact API: Maximum length violations return 400', async () => {
  const longName = 'a'.repeat(101);
  const longEmail = 'a'.repeat(250) + '@example.com'; // > 255 chars
  const longSubject = 's'.repeat(201);
  const longMessage = 'm'.repeat(5001);

  const testCases = [
    { payload: { name: longName, email: 'a@b.com', subject: 's', message: 'm' }, msg: 'Name cannot exceed 100 characters.' },
    { payload: { name: 'John', email: longEmail, subject: 's', message: 'm' }, msg: 'Email cannot exceed 255 characters.' },
    { payload: { name: 'John', email: 'a@b.com', subject: longSubject, message: 'm' }, msg: 'Subject cannot exceed 200 characters.' },
    { payload: { name: 'John', email: 'a@b.com', subject: 's', message: longMessage }, msg: 'Message cannot exceed 5000 characters.' },
  ];

  let ipCounter = 30;
  for (const tc of testCases) {
    const res = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': `203.0.113.${ipCounter++}`,
      },
      body: JSON.stringify(tc.payload),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.message, tc.msg);
  }
});

test('Contact API: Database creation failure returns 500', async () => {
  shouldFailDb = true;
  const res = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': '203.0.113.40',
    },
    body: JSON.stringify({ name: 'John', email: 'john@example.com', subject: 'Sub', message: 'Msg' }),
  });
  const data = await res.json();
  assert.strictEqual(res.status, 500);
  assert.strictEqual(data.success, false);
  assert.strictEqual(data.message, 'Database save failed');
  shouldFailDb = false;
});

test('Contact API: Email notification failure does not prevent 201 response', async () => {
  const oldUser = process.env.EMAIL_USER;
  const oldPass = process.env.EMAIL_APP_PASSWORD;
  const oldHost = process.env.EMAIL_HOST;

  process.env.EMAIL_USER = 'test@example.com';
  process.env.EMAIL_APP_PASSWORD = 'password';
  process.env.EMAIL_HOST = 'invalid.nonexistent.smtp.host';

  const res = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': '203.0.113.41',
    },
    body: JSON.stringify({ name: 'John', email: 'john@example.com', subject: 'Sub', message: 'Msg' }),
  });
  const data = await res.json();

  process.env.EMAIL_USER = oldUser;
  process.env.EMAIL_APP_PASSWORD = oldPass;
  process.env.EMAIL_HOST = oldHost;

  assert.strictEqual(res.status, 201);
  assert.strictEqual(data.success, true);
});

test('Contact API: Rate limiter allows 5 submissions and rejects 6th with 429', async () => {
  const rateLimitIp = '198.51.100.42';

  // Make 5 successful requests from the same IP
  for (let i = 0; i < 5; i++) {
    const res = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': rateLimitIp,
      },
      body: JSON.stringify({ name: `User ${i}`, email: 'user@example.com', subject: 'Sub', message: 'Msg' }),
    });
    assert.strictEqual(res.status, 201);
  }

  // 6th request from the same IP should be rate limited (429)
  const res6 = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': rateLimitIp,
    },
    body: JSON.stringify({ name: 'User 6', email: 'user@example.com', subject: 'Sub', message: 'Msg' }),
  });
  const data6 = await res6.json();

  assert.strictEqual(res6.status, 429);
  assert.strictEqual(data6.success, false);
  assert.strictEqual(data6.message, 'Too many contact submissions from this IP, please try again after 15 minutes.');
});
