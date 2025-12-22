import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
    private store = new Map<string, any>();

    async get<T>(key: string): Promise<T | undefined> {
        const item = this.store.get(key);
        if (!item) return undefined;
        if (item.expiry && item.expiry < Date.now()) {
            this.store.delete(key);
            return undefined;
        }
        return item.value;
    }

    async set(key: string, value: any, ttlSeconds: number): Promise<void> {
        this.store.set(key, {
            value,
            expiry: Date.now() + ttlSeconds * 1000,
        });
    }

    async del(key: string): Promise<void> {
        this.store.delete(key);
    }
}
