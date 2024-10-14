const { listAllRows } = require(`../events/databaseManager.js`);
const { decryptData } = require('../libs/encryption.js');

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// TODO 1: Have this bot be able to remind on time even after bot's reboot.
// TODO 2: Have this bot constantly check unix time and remind on time, without delay. No idea how to do this without using too much resources but will learn how.

// IDEA 1: If bot is about to crash, immediately DM everyone who are attached to the bot's database stating that bot is crashed and need to be rebooted manually by the bot host.

setInterval(async() => {
    var listRows = await listAllRows();
    var JSONRow = JSON.stringify(listRows, null, 2);
    var parsedJSON = JSON.parse(JSONRow);
    var userId = 0;
    var expireTime = 0;
    var scheduleTime = 0;
    var message = '';

    for (const key in parsedJSON) {
        userId = decryptData(parsedJSON[key].userId);
        description = decryptData(parsedJSON[key].description);
        typeName = decryptData(parsedJSON[key].typeName);
        coordinate = decryptData(parsedJSON[key].coordinate);
        expireTime = decryptData(parsedJSON[key].expirationTimestamp);
        scheduleTime = decryptData(parsedJSON[key].schedule);
        
        if (scheduleTime > Date.now()) return;

        const user = await client.users.fetch(userId).catch(() => null);

        if (typeName === "pearl") {
            message = `${description}'s fuel is about to run out, be sure to refuel that pearl! Pearl's fuel will run out <t:${expireTime}:R>`;
        }
        else if (typeName === "snitch") {
            message = `${description} snitch at ${coordinate} is about to deactivate, be sure to refresh that snitch! Snitch will be deactivated <t:${expireTime}:R>`;
        }

        user?.send({
            content: message,
            ephemeral: true
        })
    }
}, 1000 * 5);