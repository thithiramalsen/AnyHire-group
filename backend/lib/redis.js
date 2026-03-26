import Redis from "ioredis"
import dotenv from "dotenv"

dotenv.config()

// Parse the Redis URL
const redisUrl = new URL(process.env.UPSTASH_REDIS_URL || "");

// Decide whether to enable TLS based on the URL scheme (rediss: means TLS)
const useTls = redisUrl.protocol === 'rediss:';

const redisOptions = {
    host: redisUrl.hostname,
    port: redisUrl.port ? Number(redisUrl.port) : undefined,
    password: redisUrl.password || undefined,
};

if (useTls) {
    // Only add `tls` when the URL indicates TLS (avoid forcing TLS to a plain endpoint)
    redisOptions.tls = {
        rejectUnauthorized: false
    };
}

export const redis = new Redis(redisOptions);

// Add error handling
redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redis.on('connect', () => {
    console.log('Redis connected successfully');
});


