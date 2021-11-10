class CacheDatabase {
    constructor() {
        this.cache = new Map();
        this.cacheExpire = new Map();
    }

    set(key, value) {
        this.cache.set(key, value);
        this.refreshExpiry(key);
    }

    refreshExpiry(key) {
        this.cacheExpire.set(key, new Date().getTime() + process.env.REDIS_API_CACHE_EXPIRE || 1800);
    }

    isExpired(key) {
        return this.cacheExpire.get(key) < new Date().getTime();
    }

    get(key) {
        if (this.isExpired(key)) {
            this.cache.delete(key);
            this.cacheExpire.delete(key);
            return null
        }
        return this.cache.get(key);
    }

    clear() {
        this.cache = new Map();
        this.cacheExpire = new Map();
    }
}

module.exports = new CacheDatabase();