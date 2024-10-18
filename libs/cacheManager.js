const cache = new Map();
const activeTimeouts = new Map();

class CacheManager {
    // Method to add an item to the cache
    static addReminder(reminderId, reminder) {
        cache.set(reminderId, reminder);
    }

    // Method to get an item from the cache
    static getReminder(reminderId) {
        return cache.get(reminderId);
    }

    // Method to get all entries from the cache
    static getEntries() {
        return cache.entries();
    }

    // Method to remove an item from the cache
    static removeReminder(reminderId) {
        cache.delete(reminderId);
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
    static isReminderCached(reminderId) {
        return cache.has(reminderId);
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