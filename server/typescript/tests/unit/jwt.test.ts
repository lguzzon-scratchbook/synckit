import { describe, test, expect } from 'bun:test';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  generateTokens,
  type TokenPayload,
} from '../../src/auth/jwt';
import { createUserPermissions, createAdminPermissions } from '../../src/auth/rbac';

describe('JWT - Token Generation', () => {
  test('should generate access token', () => {
    const payload = {
      userId: 'user-123',
      email: 'test@example.com',
      permissions: createUserPermissions(['doc-1'], ['doc-2']),
    };

    const token = generateAccessToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // JWT has 3 parts
  });

  test('should generate refresh token', () => {
    const token = generateRefreshToken('user-456');
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);
  });

  test('should generate both tokens', () => {
    const tokens = generateTokens(
      'user-789',
      'user@example.com',
      createAdminPermissions()
    );

    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
    expect(tokens.accessToken).not.toBe(tokens.refreshToken);
  });
});

describe('JWT - Token Verification', () => {
  test('should verify valid token', () => {
    const payload = {
      userId: 'user-verify',
      email: 'verify@example.com',
      permissions: createUserPermissions(['doc-1'], []),
    };

    const token = generateAccessToken(payload);
    const verified = verifyToken(token);

    expect(verified).toBeDefined();
    expect(verified?.userId).toBe('user-verify');
    expect(verified?.email).toBe('verify@example.com');
  });

  test('should return null for invalid token', () => {
    const verified = verifyToken('invalid.token.here');
    expect(verified).toBeNull();
  });

  test('should return null for malformed token', () => {
    const verified = verifyToken('not-a-token');
    expect(verified).toBeNull();
  });

  test('should decode token without verification', () => {
    const payload = {
      userId: 'user-decode',
      email: 'decode@example.com',
      permissions: createAdminPermissions(),
    };

    const token = generateAccessToken(payload);
    const decoded = decodeToken(token);

    expect(decoded).toBeDefined();
    expect(decoded?.userId).toBe('user-decode');
  });
});

describe('JWT - Token Payload', () => {
  test('should include user permissions in token', () => {
    const permissions = createUserPermissions(['doc-a', 'doc-b'], ['doc-a']);
    const token = generateAccessToken({
      userId: 'user-perms',
      email: 'perms@example.com',
      permissions,
    });

    const verified = verifyToken(token);
    expect(verified?.permissions).toBeDefined();
    expect(verified?.permissions.canRead).toContain('doc-a');
    expect(verified?.permissions.canRead).toContain('doc-b');
    expect(verified?.permissions.canWrite).toContain('doc-a');
    expect(verified?.permissions.isAdmin).toBe(false);
  });

  test('should include admin flag in token', () => {
    const token = generateAccessToken({
      userId: 'admin-user',
      email: 'admin@example.com',
      permissions: createAdminPermissions(),
    });

    const verified = verifyToken(token);
    expect(verified?.permissions.isAdmin).toBe(true);
  });
});

describe('JWT - Round-trip', () => {
  test('should generate, verify, and decode consistently', () => {
    const original = {
      userId: 'roundtrip-user',
      email: 'roundtrip@example.com',
      permissions: createUserPermissions(['doc-x'], ['doc-y', 'doc-z']),
    };

    const token = generateAccessToken(original);
    const verified = verifyToken(token);
    const decoded = decodeToken(token);

    expect(verified?.userId).toBe(original.userId);
    expect(verified?.email).toBe(original.email);
    expect(decoded?.userId).toBe(original.userId);
    expect(decoded?.email).toBe(original.email);
  });
});
