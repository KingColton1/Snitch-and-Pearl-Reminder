const { listAllRows } = require('../events/databaseManager.js');
const { decryptData } = require('../libs/encryption.js');
const { hostUserId } = require('../libs/config.js');

var crashNoticeSent = false;

// Function to send crash notice to all users in the database
async function sendCrashNotice(client, crashErrorMessage) {
    if (crashNoticeSent) return;
    crashNoticeSent = true;

    try {
        // Fetch all rows (users) from the database
        const rows = await listAllRows();
        const parsedJSON = JSON.parse(JSON.stringify(rows));
        const botHost = await client.users.fetch(hostUserId);
        const uniqueUserIds = new Set();

        // Prepare the crash message
        const message = `⚠️ **Bot is about to crash** ⚠️\nThe bot encountered an error and needs to be rebooted. Bot host is contacted and will reboot soon.\nError details:\n\`${crashErrorMessage}\``;

        // Add unique userIds to the Set
        parsedJSON.forEach((row) => {
            const userId = decryptData(row.userId);
            if (userId && userId !== hostUserId) {
                uniqueUserIds.add(userId);
            }
        });

        // Fetch all unique users
        const userPromises = [...uniqueUserIds].map(async (userId) => {
            return client.users.fetch(userId).catch(() => null);
        });

        const users = await Promise.all(userPromises); // Wait for user fetches to finish
        const validUsers = users.filter(user => user); // Validate users and filter out null

        // Send messages in batches
        for (const user of validUsers) {
            try {
                await user.send(message);
            } catch (err) {
                console.error(`Failed to send crash notice to user ${user.id}: `, err);
            }
        }

        // Send crash notice to the bot host
        try {
            if (botHost) {
                await botHost.send(message);
            }
        } catch (err) {
            console.error(`Failed to send crash notice to bot host: `, err);
        }
    }
    catch (err) {
        console.error(`An error occurred while sending crash notices: `, error);
    }

    // Allow all messages to be sent before bot's shutdown
    await new Promise(resolve => setTimeout(resolve, 1000));
}

module.exports = {
    sendCrashNotice
}