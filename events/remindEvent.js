const { listAllRows } = require(`../events/databaseManager.js`);
const { decryptData } = require('../libs/encryption.js');

// TODO 1: Have this bot be able to remind on time even after bot's reboot.
// TODO 2: Have this bot constantly check unix time and remind on time, without delay. No idea how to do this without using too much resources but will learn how.

// IDEA 1: If bot is about to crash, immediately DM everyone who are attached to the bot's database stating that bot is crashed and need to be rebooted manually by the bot host.