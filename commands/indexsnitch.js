const { SlashCommandBuilder } = require('discord.js');
const { listAllRows, addRow } = require('../events/databaseManager.js');
const { encryptData, decryptData } = require('../libs/encryption.js');
const { calculateSchedule } = require('../libs/timeConverter.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('indexsnitch')
		.setDescription('Indexes all snitches. Default reminder: 5 days before expiration (4 weeks from now).')
        .addChannelOption(option =>
            option.setName('channel')
            .setDescription('Choose a snitch channel you want this bot to index')
            .setRequired(true)
        )
        .setDMPermission(false),
    async execute(interaction) {
        const channelTarget = interaction.options.getChannel('channel');
        const snitchRegex = /`\[(\d{2}:\d{2}:\d{2})\]`\s`\[(.+?)\]`\s\*\*(.+?)\*\*\sis\sat\s(.*?)\s\(([-\d]+),([-\d]+),([-\d]+)\)/;
        var message = '';
        var unnamedSnitchCount = 1;
        var totalIndexed = 0;

        // Delay helper function to add a pause between fetches
        async function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        var listRows = await listAllRows();
        var JSONRow = JSON.stringify(listRows, null, 2);
        var parsedJSON = JSON.parse(JSONRow);
        const processedCoordinates = new Set();

        // Helper function to recursively fetch all messages
        async function fetchAllMessages(channel, beforeMessageId = null) {
            const options = { limit: 100 };
            if (beforeMessageId) {
                options.before = beforeMessageId;
            }

            const messages = await channel.messages.fetch(options);
            if (messages.size === 0) return; // Stop when there are no more messages

            for (const msg of messages.values()) {
                var match = snitchRegex.exec(msg.content);

                if (match) {
                    var namelayerName = match[2]; // unnecessary for now
                    var snitchName = match[4];
                    var coordinates = `${match[5]},${match[6]},${match[7]}`;
                    var expirationTime = Math.floor(Date.now() / 1000) + (28 * 24 * 60 * 60);

                    // Check if the current coordinates are already processed
                    if (processedCoordinates.has(coordinates)) {
                        continue;
                    }

                    // Add current coordinates to the set to avoid duplicates
                    processedCoordinates.add(coordinates);

                    var isDuplicate = false;
                    for (const key in parsedJSON) {
                        var decryptedCoord = decryptData(parsedJSON[key].coordinate);

                        // Compare the coordinates to avoid duplicates
                        if (coordinates === decryptedCoord) {
                            isDuplicate = true;
                            break;
                        }
                    }

                    if (!isDuplicate) {
                        // Assign a unique name to unnamed snitches
                        var newSnitchName = snitchName.trim() ? snitchName : `${namelayerName}-${unnamedSnitchCount++}`;

                        // Encrypt inputs
                        var encryptedUserId = encryptData(interaction.user.id);
                        var encryptedServerId = encryptData(interaction.guild.id);
                        var encryptedType = encryptData('snitch');
                        var encryptedName = encryptData(newSnitchName);
                        var encryptedNL = encryptData(namelayerName);
                        var encryptedCoord = encryptData(coordinates);
                        var encryptedSchedule = encryptData(await calculateSchedule('5days', expirationTime));
                        var encryptedDM = encryptData(true);
                        var encryptedChannel = encryptData('0');
                        var encryptedExpire = encryptData(expirationTime);
                        var encryptedSubmit = encryptData(Math.floor(Date.now() / 1000));

                        // Save them to the database
                        await addRow(encryptedUserId, encryptedServerId, encryptedType, encryptedName, encryptedNL, encryptedCoord, encryptedSchedule, encryptedDM, encryptedChannel, encryptedSubmit, encryptedExpire);
                        totalIndexed++; // Increment count of indexed snitches
                    }
                }
            }

            const lastMessageId = messages.last().id;

            // Add a delay of 1 second between message fetches to avoid hitting rate limits
            await delay(1000);

            // Fetch the next batch of messages
            await fetchAllMessages(channel, lastMessageId);
        }

        // Start fetching all messages from the channel
        await fetchAllMessages(channelTarget);

        if (totalIndexed === 0) {
            message = `No snitch log with new coordinate found in ${channelTarget} channel.`;
        }
        else {
            message = `Successfully indexed ${totalIndexed} snitch logs in ${channelTarget}.`;
        }

        // Reply with the result of indexing
        await interaction.reply({
            content: message,
            ephemeral: true
        });
    }
};