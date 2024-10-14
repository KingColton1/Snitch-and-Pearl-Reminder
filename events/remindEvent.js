const { listAllRows } = require(`../events/databaseManager.js`);
const { decryptData } = require('../libs/encryption.js');

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

module.exports = async (client) => {
    const currentTime = Math.floor(Date.now() / 1000);

    const rows = await listAllRows();
    var JSONRow = JSON.stringify(rows, null, 2);
    var parsedJSON = JSON.parse(JSONRow);
    var userId = 0;
    var expireTime = 0;
    var scheduleTime = 0;
    var message = '';

    for (const row in rows) {
        userId = decryptData(parsedJSON[row].userId);
        description = decryptData(parsedJSON[row].description);
        typeName = decryptData(parsedJSON[row].typeName);
        coordinate = decryptData(parsedJSON[row].coordinate);
        expireTime = decryptData(parsedJSON[row].expirationTimestamp);
        scheduleTime = decryptData(parsedJSON[row].schedule);
        isDMEnabled = decryptData(parsedJSON[row].isDMEnabled);
        channelTarget = decryptData(parsedJSON[row].channelTarget);

        console.log(userId);
        console.log(scheduleTime + " | " + currentTime);
        
        if (scheduleTime === currentTime && expireTime > currentTime) {
            const user = await client.users.fetch(userId).catch(() => null);

            console.log("On schedule time and not past expired time");

            if (user) {
                console.log(`trying to send message to ${user}...`);

                // Calculate time remaining until the schedule time
                const timeUntilReminder = (scheduleTime - currentTime) * 1000;

                if (typeName === "pearl") {
                    message = `${description}'s fuel is about to run out, be sure to refuel that pearl! Pearl's fuel will run out <t:${expireTime}:R>`;
                }
                else if (typeName === "snitch") {
                    message = `${description} snitch at ${coordinate} is about to deactivate, be sure to refresh that snitch! Snitch will be deactivated <t:${expireTime}:R>`;
                }

                if (isDMEnabled == true) {
                    await scheduleReminder(client, userId, message, timeUntilReminder)
                }
                else if (isDMEnabled == false) {
                    // TODO 3: send to a channel assigned by a user
                }
            }
        }
    }
}