const { listRowsInTimeRange } = require(`../events/databaseManager.js`);
const { decryptData } = require('../libs/encryption.js');

// TODO 1: Have this bot be able to remind on time even after bot's reboot.
// TODO 2: Have this bot constantly check unix time and remind on time, without delay. No idea how to do this without using too much resources but will learn how.

// IDEA 1: If bot is about to crash, immediately DM everyone who are attached to the bot's database stating that bot is crashed and need to be rebooted manually by the bot host.

module.exports = async (client) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const nextCheckTime = currentTime + (10 * 60); // 10 minutes ahead

    const rows = await listRowsInTimeRange(currentTime, nextCheckTime);
    //var JSONRow = JSON.stringify(rows, null, 2);
    //var parsedJSON = JSON.parse(JSONRow);
    var userId = 0;
    var expireTime = 0;
    var scheduleTime = 0;
    var message = '';

    for (const row in rows) {
        userId = decryptData(row.userId);
        description = decryptData(row.description);
        typeName = decryptData(row.typeName);
        coordinate = decryptData(row.coordinate);
        expireTime = decryptData(row.expirationTimestamp);
        scheduleTime = decryptData(row.schedule);
        isDMEnabled = decryptData(row.isDMEnabled);
        channelTarget = decryptData(row.channelTarget);
        
        if (scheduleTime <= currentTime && expireTime > currentTime) {
            const user = await client.users.fetch(userId).catch(() => null);

            if (user) {
                console.log(`trying to send message to ${user}...`);

                if (typeName === "pearl") {
                    message = `${description}'s fuel is about to run out, be sure to refuel that pearl! Pearl's fuel will run out <t:${expireTime}:R>`;
                }
                else if (typeName === "snitch") {
                    message = `${description} snitch at ${coordinate} is about to deactivate, be sure to refresh that snitch! Snitch will be deactivated <t:${expireTime}:R>`;
                }

                if (isDMEnabled == true) {
                    user?.send({
                        content: message,
                        ephemeral: true
                    });
                }
                else if (isDMEnabled == false) {
                    // TODO 3: send to a channel assigned by a user
                }
            }
        }
    }
}