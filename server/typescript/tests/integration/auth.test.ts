import { describe, test, expect } from 'bun:test';
import { Hono } from 'hono';
import { auth } from '../../src/routes/auth';

describe('Auth Endpoints - Login', () => {
  const app = new Hono();
  app.route('/auth', auth);

  test('should login successfully with valid credentials', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        permissions: {
          canRead: ['doc-1'],
          canWrite: ['doc-1'],
          isAdmin: false,
        },
      }),
    });

    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.userId).toBeDefined();
    expect(data.email).toBe('test@example.com');
    expect(data.accessToken).toBeDefined();
    expect(data.refreshToken).toBeDefined();
    expect(data.permissions).toBeDefined();
  });

  test('should return 400 for missing email', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: 'password123',
      }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test('should return 400 for missing password', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
      }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test('should create admin permissions when requested', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
        permissions: {
          isAdmin: true,
        },
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.permissions.isAdmin).toBe(true);
  });
});

describe('Auth Endpoints - Token Refresh', () => {
  const app = new Hono();
  app.route('/auth', auth);

  test('should refresh token with valid refresh token', async () => {
    // First login to get tokens
    const loginRes = await app.request('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'refresh@example.com',
        password: 'password123',
      }),
    });

    const loginData = await loginRes.json();
    const refreshToken = loginData.refreshToken;

    // Then refresh
    const refreshRes = await app.request('/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });

    expect(refreshRes.status).toBe(200);
    const refreshData = await refreshRes.json();
    expect(refreshData.accessToken).toBeDefined();
    expect(refreshData.refreshToken).toBeDefined();
  });

  test('should return 400 for missing refresh token', async () => {
    const res = await app.request('/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  test('should return 401 for invalid refresh token', async () => {
    const res = await app.request('/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: 'invalid.token.here',
      }),
    });

    expect(res.status).toBe(401);
  });
});

describe('Auth Endpoints - Verify Token', () => {
  const app = new Hono();
  app.route('/auth', auth);

  test('should verify valid token', async () => {
    // First login
    const loginRes = await app.request('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'verify@example.com',
        password: 'password123',
      }),
    });

    const loginData = await loginRes.json();
    const token = loginData.accessToken;

    // Then verify
    const verifyRes = await app.request('/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    expect(verifyRes.status).toBe(200);
    const verifyData = await verifyRes.json();
    expect(verifyData.valid).toBe(true);
    expect(verifyData.userId).toBeDefined();
  });

  test('should return invalid for bad token', async () => {
    const res = await app.request('/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'invalid.token.here',
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.valid).toBe(false);
  });
});

describe('Auth Endpoints - Get Current User', () => {
  const app = new Hono();
  app.route('/auth', auth);

  test('should return user info with valid token', async () => {
    // First login
    const loginRes = await app.request('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'me@example.com',
        password: 'password123',
      }),
    });

    const loginData = await loginRes.json();
    const token = loginData.accessToken;

    // Then get user info
    const meRes = await app.request('/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    expect(meRes.status).toBe(200);
    const meData = await meRes.json();
    expect(meData.userId).toBeDefined();
    expect(meData.email).toBe('me@example.com');
    expect(meData.permissions).toBeDefined();
  });

  test('should return 401 without token', async () => {
    const res = await app.request('/auth/me', {
      method: 'GET',
    });

    expect(res.status).toBe(401);
  });

  test('should return 401 with invalid token', async () => {
    const res = await app.request('/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid.token.here',
      },
    });

    expect(res.status).toBe(401);
  });
});
