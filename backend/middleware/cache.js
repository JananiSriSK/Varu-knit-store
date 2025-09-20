import { client, isRedisConnected } from '../config/redis.js';

export const cacheProducts = (duration = 3600) => {
  return async (req, res, next) => {
    if (!isRedisConnected) return next();
    
    const key = `products:${JSON.stringify(req.query)}`;
    
    try {
      const cached = await client.get(key);
      if (cached) return res.json(JSON.parse(cached));
      
      res.sendResponse = res.json;
      res.json = (body) => {
        if (isRedisConnected) {
          client.setEx(key, duration, JSON.stringify(body)).catch(() => {});
        }
        res.sendResponse(body);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};

export const clearCache = (pattern) => {
  return async (req, res, next) => {
    if (isRedisConnected) {
      try {
        const keys = await client.keys(pattern);
        if (keys.length > 0) await client.del(keys);
      } catch (error) {}
    }
    next();
  };
};