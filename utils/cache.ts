
interface CacheItem<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

const CACHE_PREFIX = 'tunestream_cache_';

export const TTL = {
    CATEGORIES: 24 * 60 * 60 * 1000, // 24 Hours
    PLAYLISTS: 60 * 60 * 1000,       // 1 Hour
    LYRICS: Infinity                 // Forever
};

export const cache = {
    get: <T>(key: string): T | null => {
        try {
            const itemStr = localStorage.getItem(CACHE_PREFIX + key);
            if (!itemStr) return null;

            const item: CacheItem<T> = JSON.parse(itemStr);
            const now = Date.now();

            // Check if expired (unless infinite)
            if (item.ttl !== Infinity && now - item.timestamp > item.ttl) {
                localStorage.removeItem(CACHE_PREFIX + key);
                return null; // Expired
            }

            return item.data;
        } catch (e) {
            console.warn("Cache read error", e);
            return null;
        }
    },

    set: (key: string, data: any, ttl: number): void => {
        try {
            const item: CacheItem<any> = {
                data,
                timestamp: Date.now(),
                ttl
            };
            localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
        } catch (e) {
            console.warn("Cache write error", e);
        }
    },

    // Helper to respond with cache or fetch fresh
    fetchWithCache: async <T>(
        key: string,
        ttl: number,
        fetcher: () => Promise<T>
    ): Promise<T> => {
        const cached = cache.get<T>(key);
        if (cached) {
            // console.debug(`[Cache] Hit: ${key}`);
            return cached;
        }

        // console.debug(`[Cache] Miss: ${key}`);
        const data = await fetcher();
        if (data) {
            cache.set(key, data, ttl);
        }
        return data;
    }
};
