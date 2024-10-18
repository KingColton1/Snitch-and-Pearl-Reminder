const { listAllRows } = require(`../events/databaseManager.js`);
const { decryptData } = require('../libs/encryption.js');
const CacheManager = require('../libs/cacheManager.js');

// IDEA 1: If bot is about to crash, immediately DM everyone who are attached to the bot's database stating that bot is crashed and need to be rebooted manually by the bot host.

// Function to dynamically schedule reminders
async function scheduleReminder(client, reminderKey, userId, message, delay) {
    if (CacheManager.isTimeoutActive(reminderKey)) {
        return;
    }

    const timeoutId = setTimeout(async () => {
        const user = await client.users.fetch(userId).catch(() => null);
        if (user) {
            user.send({ content: message });
        }
        CacheManager.removeTimeout(reminderKey);
        CacheManager.removeReminder(reminderKey);
    }, delay * 1000);

    CacheManager.cacheTimeout(reminderKey, timeoutId);
}

async function messageContent(client, reminderKey, userId, itemName, namelayerName, typeName, coordinate, expireTime, isDMEnabled, channelTarget, timeUntilReminder) {
    var message = '';

    if (typeName === "pearl") {
        message = `${itemName}'s fuel is about to run out, be sure to refuel that pearl! Pearl's fuel will run out <t:${expireTime}:R>`;
    }
    else if (typeName === "snitch") {
        message = `${itemName} snitch at ${coordinate} is about to deactivate, be sure to refresh that snitch! Snitch will be deactivated <t:${expireTime}:R>`;
    }

    if (isDMEnabled === 'true' || isDMEnabled === true) {
        await scheduleReminder(client, reminderKey, userId, message, timeUntilReminder);
    }
    else if (isDMEnabled === 'false' || isDMEnabled === false) {
        // TODO 3: send to a channel assigned by a user
    }
}

async function remindEvent(client) {
    const currentTime = Math.floor(Date.now() / 1000);

    // Check the cache first
    for (const [reminderKey, cachedReminder] of CacheManager.getEntries()) {
        const { userId, itemName, namelayerName, typeName, coordinate, expireTime, scheduleTime, isDMEnabled, channelTarget } = cachedReminder;

        // If the reminder is still valid, skip database lookup
        if (CacheManager.isReminderValid(expireTime)) {
            //console.log('Reminder is cached and valid.');

            if (scheduleTime > currentTime && expireTime > currentTime) {
                const timeUntilReminder = scheduleTime - currentTime;
                await messageContent(client, reminderKey, userId, itemName, namelayerName, typeName, coordinate, expireTime, isDMEnabled, channelTarget, timeUntilReminder);
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
        var itemName = decryptData(parsedJSON[row].itemName) || 'undefined name';
        var namelayerName = decryptData(parsedJSON[row].namelayerName) || '-';
        var typeName = decryptData(parsedJSON[row].typeName) || 'undefined type';
        var coordinate = decryptData(parsedJSON[row].coordinate) || '0,0,0';
        var expireTime = decryptData(parsedJSON[row].expirationTimestamp) || 0;
        var scheduleTime = decryptData(parsedJSON[row].schedule) || 0;
        var isDMEnabled = decryptData(parsedJSON[row].isDMEnabled) || true;
        var channelTarget = decryptData(parsedJSON[row].channelTarget) || 0;

        const reminderKey = `${parsedJSON[row].userId}-${parsedJSON[row].itemName}`;

        CacheManager.addReminder(reminderKey, {
            userId,
            itemName,
            namelayerName,
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
            await messageContent(client, reminderKey, userId, itemName, namelayerName, typeName, coordinate, expireTime, isDMEnabled, channelTarget, timeUntilReminder);
        }
    }
}

module.exports = {
    messageContent,
    remindEvent
}