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
        this.cacheExpire.set(key, new Date().getTime() + parseInt(process.env.REDIS_API_CACHE_EXPIRE || 1800) * 1000);
    }

    isExpired(key) {
        if (this.keyExist(key)) {
            return this.cacheExpire.get(key) < new Date().getTime();
        } else {
            return true
        }
    }

    keyExist(key) {
        return this.cache.has(key);
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