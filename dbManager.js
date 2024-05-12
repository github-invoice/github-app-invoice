const redis = require('redis');

class RedisClient {
  constructor(options) {
    this.client = redis.createClient(options);
    this.client.on('error', (error) => {
      console.error('Redis error:', error);
    });
  }

  set(key, value, callback) {
    this.client.set(key, value, callback);
  }

  get(key, callback) {
    this.client.get(key, callback);
  }

  incr(key, callback) {
    this.client.incr(key, callback);
  }

  quit() {
    this.client.quit();
  }
}

// Example usage
const redisClient = new RedisClient({
  host: 'localhost',
  port: 63,
});

// Set a key-value pair
redisClient.set('mykey', 'myvalue', (error, reply) => {
  if (error) {
    console.error('Error setting key:', error);
  } else {
    console.log('Key set:', reply);
  }
});

// Get the value for a key
redisClient.get('mykey', (error, reply) => {
  if (error) {
    console.error('Error getting key:', error);
  } else {
    console.log('Value for key:', reply);
  }
});

// Increment a counter
redisClient.incr('counter', (error, reply) => {
  if (error) {
    console.error('Error incrementing counter:', error);
  } else {
    console.log('Counter:', reply);
  }
});

// Quit the client when done
redisClient.quit();
