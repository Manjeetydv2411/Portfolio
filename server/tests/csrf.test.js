import test from 'node:test';
import assert from 'node:assert';
import { validateOrigin } from '../middleware/csrfMiddleware.js';

const mockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  return res;
};

test('validateOrigin: Trusted origin accepted in production', () => {
  process.env.NODE_ENV = 'production';
  process.env.CLIENT_URL = 'https://myportfolio.com';

  const req = {
    method: 'POST',
    headers: { origin: 'https://myportfolio.com' },
  };
  const res = mockRes();
  let nextCalled = false;
  let nextError = null;

  validateOrigin(req, res, (err) => {
    nextCalled = true;
    nextError = err;
  });

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(nextError, undefined);
  process.env.NODE_ENV = 'development';
});

test('validateOrigin: Malicious origin with trusted domain as prefix rejected in production', () => {
  process.env.NODE_ENV = 'production';
  process.env.CLIENT_URL = 'https://myportfolio.com';

  const req = {
    method: 'POST',
    headers: { origin: 'https://myportfolio.com.evil.com' },
  };
  const res = mockRes();
  let nextCalled = false;
  let nextError = null;

  validateOrigin(req, res, (err) => {
    nextCalled = true;
    nextError = err;
  });

  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(nextError instanceof Error, true);
  process.env.NODE_ENV = 'development';
});

test('validateOrigin: Different origin rejected in production', () => {
  process.env.NODE_ENV = 'production';
  process.env.CLIENT_URL = 'https://myportfolio.com';

  const req = {
    method: 'POST',
    headers: { origin: 'https://untrusted.com' },
  };
  const res = mockRes();
  let nextCalled = false;
  let nextError = null;

  validateOrigin(req, res, (err) => {
    nextCalled = true;
    nextError = err;
  });

  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(nextError instanceof Error, true);
  process.env.NODE_ENV = 'development';
});

test('validateOrigin: Missing origin/referer rejected in production', () => {
  process.env.NODE_ENV = 'production';
  process.env.CLIENT_URL = 'https://myportfolio.com';

  const req = {
    method: 'POST',
    headers: {},
  };
  const res = mockRes();
  let nextCalled = false;
  let nextError = null;

  validateOrigin(req, res, (err) => {
    nextCalled = true;
    nextError = err;
  });

  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(nextError instanceof Error, true);
  process.env.NODE_ENV = 'development';
});

test('validateOrigin: Development requests without origin still work', () => {
  process.env.NODE_ENV = 'development';
  process.env.CLIENT_URL = 'http://localhost:5173';

  const req = {
    method: 'POST',
    headers: {},
  };
  const res = mockRes();
  let nextCalled = false;
  let nextError = null;

  validateOrigin(req, res, (err) => {
    nextCalled = true;
    nextError = err;
  });

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(nextError, undefined);
});
