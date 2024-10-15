const { Events, Client, ClientUser, Application } = require('discord.js');
const { connectDatabase, listAllRows } = require('./databaseManager.js');
const CacheManager = require('../libs/cacheManager.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        // Connect to the database and create a template table if it doesn't exist yet
        await connectDatabase();
        console.log(`Logged in as ${client.user.tag}`);

        const rows = await listAllRows();
        var JSONRow = JSON.stringify(rows, null, 2);
        var parsedJSON = JSON.parse(JSONRow);

        for (const row of rows) {
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
        }

        console.log("Database and cache loaded, bot is ready to use.");
    },
}