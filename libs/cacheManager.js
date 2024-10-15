const cache = new Map();

class CacheManager {
    // Method to add an item to the cache
    static addReminder(key, reminder) {
        cache.set(key, reminder);
    }

    // Method to get an item from the cache
    static getReminder(key) {
        return cache.get(key);
    }

    // Method to remove an item from the cache
    static removeReminder(key) {
        cache.delete(key);
    }

    // Method to clear the cache
    static clearCache() {
        cache.clear();
    }

    // Method to check if the reminder is still valid (e.g., hasn't expired)
    static isReminderValid(expireTime) {
        const currentTime = Math.floor(Date.now() / 1000);
        return expireTime > currentTime;
    }

    // Method to check if an item is in the cache
    static isReminderCached(key) {
        return cache.has(key);
    }
}

module.exports = CacheManager;