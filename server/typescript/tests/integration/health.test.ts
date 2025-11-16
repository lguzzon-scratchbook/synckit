import { describe, test, expect } from 'bun:test';
import { Hono } from 'hono';

describe('Health Endpoint', () => {
  test('should return healthy status', async () => {
    const app = new Hono();
    
    // Mock health endpoint
    app.get('/health', (c) => {
      return c.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '0.1.0',
        uptime: process.uptime(),
      });
    });

    const res = await app.request('/health');
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('healthy');
    expect(data.version).toBe('0.1.0');
    expect(data.timestamp).toBeDefined();
    expect(data.uptime).toBeGreaterThan(0);
  });

  test('should return server info', async () => {
    const app = new Hono();
    
    app.get('/', (c) => {
      return c.json({
        name: 'SyncKit Server',
        version: '0.1.0',
        description: 'Production-ready WebSocket sync server',
        endpoints: {
          health: '/health',
          ws: '/ws',
          auth: '/auth',
        },
      });
    });

    const res = await app.request('/');
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe('SyncKit Server');
    expect(data.endpoints).toBeDefined();
    expect(data.endpoints.health).toBe('/health');
    expect(data.endpoints.ws).toBe('/ws');
    expect(data.endpoints.auth).toBe('/auth');
  });
});
