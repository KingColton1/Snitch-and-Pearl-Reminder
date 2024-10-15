const { listAllRows } = require(`../events/databaseManager.js`);
const { decryptData } = require('../libs/encryption.js');
const CacheManager = require('../libs/cacheManager.js');

// TODO 1: Have this bot be able to remind on time even after bot's reboot.
// TODO 2: Have this bot constantly check unix time and remind on time, without delay. No idea how to do this without using too much resources but will learn how.

// IDEA 1: If bot is about to crash, immediately DM everyone who are attached to the bot's database stating that bot is crashed and need to be rebooted manually by the bot host.

// Function to dynamically schedule reminders
async function scheduleReminder(client, userId, message, delay) {
    setTimeout(async () => {
        const user = await client.users.fetch(userId).catch(() => null);
        if (user) {
            console.log(`Sending reminder to ${user.tag}`);
            user.send({ content: message });
        }
    }, delay);
}

async function messageContent(client, userId, description, typeName, coordinate, expireTime, isDMEnabled, channelTarget, timeUntilReminder) {
    var message = '';

    if (typeName === "pearl") {
        message = `${description}'s fuel is about to run out, be sure to refuel that pearl! Pearl's fuel will run out <t:${expireTime}:R>`;
    }
    else if (typeName === "snitch") {
        message = `${description} snitch at ${coordinate} is about to deactivate, be sure to refresh that snitch! Snitch will be deactivated <t:${expireTime}:R>`;
    }

    if (isDMEnabled == true) {
        await scheduleReminder(client, userId, message, timeUntilReminder);
    }
    else if (isDMEnabled == false) {
        // TODO 3: send to a channel assigned by a user
    }
}

module.exports = async (client) => {
    const currentTime = Math.floor(Date.now() / 1000);

    // Check the cache first
    for (const [reminderKey, cachedReminder] of CacheManager.cache.entries()) {
        const { userId, description, typeName, coordinate, expireTime, scheduleTime, isDMEnabled, channelTarget } = cachedReminder;

        // If the reminder is still valid, skip database lookup
        if (CacheManager.isReminderValid(expireTime)) {
            console.log('Reminder is cached and valid.');

            if (scheduleTime > currentTime) {
                const timeUntilReminder = scheduleTime - currentTime;
                await messageContent(client, userId, description, typeName, coordinate, expireTime, isDMEnabled, channelTarget, timeUntilReminder);
            }
        } else {
            // Remove expired reminder from cache
            CacheManager.removeReminder(reminderKey);
        }
    }

    // Otherwise, make a new cache row
    const rows = await listAllRows();
    var JSONRow = JSON.stringify(rows, null, 2);
    var parsedJSON = JSON.parse(JSONRow);

    for (const row in rows) {
        var userId = decryptData(parsedJSON[row].userId) || 0;
        var description = decryptData(parsedJSON[row].description) || 'undefined name';
        var typeName = decryptData(parsedJSON[row].typeName) || 'undefined type';
        var coordinate = decryptData(parsedJSON[row].coordinate) || '0,0,0';
        var expireTime = decryptData(parsedJSON[row].expirationTimestamp) || 0;
        var scheduleTime = decryptData(parsedJSON[row].schedule) || 0;
        var isDMEnabled = decryptData(parsedJSON[row].isDMEnabled) || true;
        var channelTarget = decryptData(parsedJSON[row].channelTarget) || 0;

        const reminderKey = `${parsedJSON[row].userId}-${parsedJSON[row].description}`;

        CacheManager.addReminder(reminderKey, {
            userId,
            description,
            typeName,
            coordinate,
            expireTime,
            scheduleTime,
            isDMEnabled,
            channelTarget
        });
        
        if (scheduleTime > currentTime && expireTime > currentTime) {
            // Calculate time remaining until the schedule time
            const timeUntilReminder = scheduleTime - currentTime;
            await messageContent(client, userId, description, typeName, coordinate, expireTime, isDMEnabled, channelTarget, timeUntilReminder);
        }
    }
}