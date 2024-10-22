const { Events } = require('discord.js');
const { connectDatabase, listAllRows } = require('./databaseManager.js');
const { decryptData } = require('../libs/encryption.js');
const { messageContent } = require('./remindEvent.js');
const CacheManager = require('../libs/cacheManager.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        // Connect to the database and create a template table if it doesn't exist yet
        await connectDatabase();
        console.log(`Logged in as ${client.user.tag}`);

        // if the code decide to break itself, use this
        //if (!isConnectedDB) return;

        const rows = await listAllRows();
        console.log("Restoring scheduled reminders...");
        for (const row of rows) {
            var userId = decryptData(row.userId) || 0;
            var itemName = decryptData(row.itemName) || 'undefined name';
            var namelayerName = decryptData(row.namelayerName) || '-';
            var typeName = decryptData(row.typeName) || 'undefined type';
            var coordinate = decryptData(row.coordinate) || '0,0,0';
            var expireTime = decryptData(row.expirationTimestamp) || 0;
            var scheduleTime = decryptData(row.schedule) || 0;
            var isDMEnabled = decryptData(row.isDMEnabled) || true;
            var channelTarget = decryptData(row.channelId) || 0;

            const reminderKey = `${row.userId}-${row.itemName}`;

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

            // Restore and re-setup reminders after reboot, if any reminder hasn't passed scheduleTime and expireTime
            const currentTime = Math.floor(Date.now() / 1000);

            if (scheduleTime > currentTime && expireTime > currentTime) {
                const timeUntilReminder = scheduleTime - currentTime;

                if (timeUntilReminder > 0) {
                    messageContent(client, reminderKey, userId, itemName, namelayerName, typeName, coordinate, expireTime, isDMEnabled, channelTarget, timeUntilReminder);
                }
            }
        }
        console.log("Database and cache loaded, bot is ready to use.");
    },
}