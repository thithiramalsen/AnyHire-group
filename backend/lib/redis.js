import Redis from "ioredis"
import dotenv from "dotenv"

dotenv.config()

// Parse the Redis URL
const redisUrl = new URL(process.env.UPSTASH_REDIS_URL);

export const redis = new Redis({
    host: redisUrl.hostname,
    port: redisUrl.port,
    password: redisUrl.password,
    tls: {
        // Required for Upstash Redis
        rejectUnauthorized: false, // Temporarily disable certificate verification
        // You can add additional TLS options if needed
        // ca: [fs.readFileSync('/path/to/ca.crt')],
        // cert: fs.readFileSync('/path/to/client.crt'),
        // key: fs.readFileSync('/path/to/client.key')
    }
});

// Add error handling
redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redis.on('connect', () => {
    console.log('Redis connected successfully');
});


