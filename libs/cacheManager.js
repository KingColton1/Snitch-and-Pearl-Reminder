const cache = new Map();
const activeTimeouts = new Map();

class CacheManager {
    // Method to add an item to the cache
    static addReminder(key, reminder) {
        cache.set(key, reminder);
    }

    // Method to get an item from the cache
    static getReminder(key) {
        return cache.get(key);
    }

    // Method to get all entries from the cache
    static getEntries() {
        return cache.entries();
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

    // Method to check if a timeout is already active
    static isTimeoutActive(reminderId) {
        return activeTimeouts.has(reminderId);
    }

    // Method to add a timeout to the activeTimeouts map
    static cacheTimeout(reminderId, timeoutId) {
        activeTimeouts.set(reminderId, timeoutId);
    }

    // Method to remove a timeout from the activeTimeouts map
    static removeTimeout(reminderId) {
        activeTimeouts.delete(reminderId);
    }

    // Method to get all cached reminders
    static getCachedReminders() {
        return activeReminders.entries();
    }
}

module.exports = CacheManager;