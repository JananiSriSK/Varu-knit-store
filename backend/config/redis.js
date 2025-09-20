import redis from 'redis';

let client = null;
let isRedisConnected = false;

client = redis.createClient();

client.on('error', () => {
  isRedisConnected = false;
});

client.on('connect', () => {
  console.log('Redis connected');
  isRedisConnected = true;
});

export { client, isRedisConnected };
export default client;