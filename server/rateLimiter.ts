// In-memory sliding-window IP rate limiter
import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

interface RequestRecord {
  timestamps: number[];
}

export function createRateLimiter(config: RateLimitConfig) {
  const ipMap = new Map<string, RequestRecord>();

  // Cleanup old entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipMap.entries()) {
      record.timestamps = record.timestamps.filter(t => now - t < config.windowMs);
      if (record.timestamps.length === 0) {
        ipMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);

  return (req: Request, res: Response, next: NextFunction): void => {
    // Determine client IP
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || 
                     req.socket.remoteAddress || 
                     '127.0.0.1';

    const now = Date.now();
    let record = ipMap.get(clientIp);

    if (!record) {
      record = { timestamps: [] };
      ipMap.set(clientIp, record);
    }

    // Filter out timestamps outside the active window
    record.timestamps = record.timestamps.filter(t => now - t < config.windowMs);

    if (record.timestamps.length >= config.maxRequests) {
      const oldestTimestamp = record.timestamps[0];
      const resetSeconds = Math.ceil((oldestTimestamp + config.windowMs - now) / 1000);

      res.setHeader('Retry-After', resetSeconds);
      res.status(429).json({
        error: config.message,
        retryAfterSeconds: resetSeconds
      });
      return;
    }

    record.timestamps.push(now);
    next();
  };
}

// Global API rate limit: 150 requests per minute
export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 150,
  message: 'Too many API requests from this IP address. Please wait a minute and retry.'
});

// File upload / analysis rate limit: 12 uploads per minute
export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 12,
  message: 'Upload analysis limit reached for this IP. Please wait 60 seconds before submitting another claim.'
});

// Admin authentication / config rate limit: 6 attempts per minute
export const adminLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 6,
  message: 'Too many admin configuration requests. Please wait a minute before retrying.'
});
