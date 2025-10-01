import Redis from 'ioredis';

// Create Redis client with better error handling
let redis: Redis | null = null;

try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: 3, // Limit retries
    lazyConnect: true, // Don't connect immediately
    connectTimeout: 5000, // 5 second timeout
  });

  redis.on('error', (err) => {
    console.warn('⚠️ Redis connection error (continuing without Redis):', err.message);
    redis = null; // Disable Redis on error
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });

  // Try to connect, but don't fail if it doesn't work
  redis.connect().catch(() => {
    console.warn('⚠️ Redis connection failed - continuing without Redis');
    redis = null;
  });
} catch (error) {
  console.warn('⚠️ Redis initialization failed - continuing without Redis');
  redis = null;
}

// Export a wrapper that handles Redis being unavailable
export const redisClient = {
  async get(key: string) {
    if (!redis) return null;
    try {
      return await redis.get(key);
    } catch (error) {
      console.warn('Redis get error:', error);
      return null;
    }
  },
  
  async set(key: string, value: string, ttl?: number) {
    if (!redis) return;
    try {
      if (ttl) {
        await redis.setex(key, ttl, value);
      } else {
        await redis.set(key, value);
      }
    } catch (error) {
      console.warn('Redis set error:', error);
    }
  },
  
  async del(key: string) {
    if (!redis) return;
    try {
      await redis.del(key);
    } catch (error) {
      console.warn('Redis del error:', error);
    }
  }
};

export { redis };