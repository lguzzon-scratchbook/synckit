import { describe, test, expect } from 'bun:test';
import { generateAccessToken, verifyToken } from '../../src/auth/jwt';
import { createUserPermissions } from '../../src/auth/rbac';
import { serializeMessage, parseMessage, createMessageId, MessageType } from '../../src/websocket/protocol';

describe('Benchmarks - JWT Performance', () => {
  test('should generate 1000 tokens in reasonable time', () => {
    const start = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      generateAccessToken({
        userId: `user-${i}`,
        email: `user${i}@example.com`,
        permissions: createUserPermissions(['doc-1'], []),
      });
    }
    
    const elapsed = performance.now() - start;
    console.log(`Generated 1000 tokens in ${elapsed.toFixed(2)}ms`);
    console.log(`Average: ${(elapsed / 1000).toFixed(2)}ms per token`);
    
    expect(elapsed).toBeLessThan(5000); // Should take less than 5 seconds
  });

  test('should verify 1000 tokens in reasonable time', () => {
    // Pre-generate tokens
    const tokens = Array.from({ length: 1000 }, (_, i) =>
      generateAccessToken({
        userId: `user-${i}`,
        email: `user${i}@example.com`,
        permissions: createUserPermissions(['doc-1'], []),
      })
    );

    const start = performance.now();
    
    for (const token of tokens) {
      verifyToken(token);
    }
    
    const elapsed = performance.now() - start;
    console.log(`Verified 1000 tokens in ${elapsed.toFixed(2)}ms`);
    console.log(`Average: ${(elapsed / 1000).toFixed(2)}ms per verification`);
    
    expect(elapsed).toBeLessThan(5000); // Should take less than 5 seconds
  });
});

describe('Benchmarks - Message Serialization', () => {
  test('should serialize 10000 messages in reasonable time', () => {
    const messages = Array.from({ length: 10000 }, (_, i) => ({
      type: MessageType.DELTA,
      id: `msg-${i}`,
      timestamp: Date.now(),
      documentId: `doc-${i % 100}`,
      delta: { field: `value-${i}` },
      vectorClock: { client1: i, client2: i * 2 },
    }));

    const start = performance.now();
    
    for (const msg of messages) {
      serializeMessage(msg as any);
    }
    
    const elapsed = performance.now() - start;
    console.log(`Serialized 10000 messages in ${elapsed.toFixed(2)}ms`);
    console.log(`Average: ${(elapsed / 10000).toFixed(3)}ms per message`);
    
    expect(elapsed).toBeLessThan(1000); // Should take less than 1 second
  });

  test('should parse 10000 messages in reasonable time', () => {
    const serialized = Array.from({ length: 10000 }, (_, i) =>
      JSON.stringify({
        type: MessageType.SYNC_REQUEST,
        id: `msg-${i}`,
        timestamp: Date.now(),
        documentId: `doc-${i % 100}`,
        vectorClock: { client1: i },
      })
    );

    const start = performance.now();
    
    for (const msg of serialized) {
      parseMessage(msg);
    }
    
    const elapsed = performance.now() - start;
    console.log(`Parsed 10000 messages in ${elapsed.toFixed(2)}ms`);
    console.log(`Average: ${(elapsed / 10000).toFixed(3)}ms per message`);
    
    expect(elapsed).toBeLessThan(1000); // Should take less than 1 second
  });

  test('should generate 10000 message IDs in reasonable time', () => {
    const start = performance.now();
    
    for (let i = 0; i < 10000; i++) {
      createMessageId();
    }
    
    const elapsed = performance.now() - start;
    console.log(`Generated 10000 message IDs in ${elapsed.toFixed(2)}ms`);
    console.log(`Average: ${(elapsed / 10000).toFixed(3)}ms per ID`);
    
    expect(elapsed).toBeLessThan(500); // Should take less than 0.5 seconds
  });
});

describe('Benchmarks - Message ID Uniqueness', () => {
  test('should generate unique IDs under concurrent generation', () => {
    const ids = new Set<string>();
    const count = 10000;

    const start = performance.now();
    
    for (let i = 0; i < count; i++) {
      ids.add(createMessageId());
    }
    
    const elapsed = performance.now() - start;
    
    console.log(`Generated ${count} IDs, ${ids.size} unique in ${elapsed.toFixed(2)}ms`);
    console.log(`Collision rate: ${((count - ids.size) / count * 100).toFixed(4)}%`);
    
    // Should have 100% uniqueness (no collisions)
    expect(ids.size).toBe(count);
  });
});
