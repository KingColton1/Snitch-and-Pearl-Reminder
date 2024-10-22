const { listAllRows } = require('../events/databaseManager.js');
const { decryptData } = require('../libs/encryption.js');
const { hostUserId } = require('../libs/config.js');

var crashNoticeSent = false;

// Function to send crash notice to all users in the database
async function sendCrashNotice(client, crashErrorMessage) {
    if (crashNoticeSent) return;

    // Fetch all rows (users) from the database
    const rows = await listAllRows();
    const parsedJSON = JSON.parse(JSON.stringify(rows));
    const botHost = await client.users.fetch(hostUserId);

    // Prepare the crash message
    const message = `⚠️ **Bot is about to crash** ⚠️\nThe bot encountered an error and needs to be rebooted. Bot host is contacted and will reboot soon.\nError details:\n\`${crashErrorMessage}\``;

    // Send crash message to each user in the database
    for (const row in parsedJSON) {
        const userId = decryptData(parsedJSON[row].userId);
        if (userId && userId !== botHost) {
            try {
                const user = await client.users.fetch(userId);
                if (user) {
                    await user.send(message);
                }
            } catch (err) {
                console.error(`Failed to send crash notice to user ${userId}:`, err);
            }
        }
    }

    // Send crash notice to the bot host
    try {
        if (botHost) {
            await botHost.send(message);
        }
    } catch (err) {
        console.error(`Failed to send crash notice to bot host:`, err);
    }
    crashNoticeSent = true;
}

module.exports = {
    sendCrashNotice,
    resetCrashNoticeFlag: () => {
        crashNoticeSent = false; // Function to reset the flag when bot restarts
    }
}