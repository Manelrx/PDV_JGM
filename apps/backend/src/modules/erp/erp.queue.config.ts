import { registerAs } from '@nestjs/config';

export default registerAs('erp-queue', () => ({
    name: 'erp-sync',
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 5000, // 5s, 10s, 20s, 40s, 80s
        },
        removeOnComplete: true,
        removeOnFail: false, // Keep in DLQ for manual inspection
    },
    limiter: {
        max: 10,
        duration: 1000,
    },
}));
