const { Events } = require('discord.js');
const { listAllRows, updateRow } = require(`./databaseManager.js`);
const { encryptData, decryptData } = require('../libs/encryption.js');
const { timeConverter, calculateSchedule, reverseSchedule } = require('../libs/timeConverter.js');
const CacheManager = require('../libs/cacheManager.js');
const TempStorage = require('../libs/tempStorage.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;

        const [_, uniqueId] = interaction.customId.split('=');
        const reminderData = TempStorage.get(uniqueId);

        if (!reminderData) {
            return interaction.reply({ content: 'Error retrieving reminder data.', ephemeral: true });
        }

        if (interaction.customId.startsWith('editReminderModal')) {
            const newName = interaction.fields.getTextInputValue('newName') || null;
            var newSchedule = interaction.fields.getTextInputValue('newSchedule') || null;
            var newExpiration = await timeConverter(interaction.fields.getTextInputValue('newExpiration')) || null;

            var newCoordinates = null;
            try {
                newCoordinates = interaction.fields.getTextInputValue('newCoordinates') || null;
            }
            catch(err){}

            var newNL = null;
            try {
                newNL = interaction.fields.getTextInputValue('newNL') || null;
            }
            catch(err){}

            // Add this section to check for limits
            if (newSchedule) {
                const timeValue = newSchedule.match(/^(\d+)\s?(second|seconds|sec|secs|minute|minutes|min|mins|day|days|hour|hours|week|weeks)$/i);
                if (timeValue) {
                    const quantity = parseInt(timeValue[1]);
                    const unit = timeValue[2].toLowerCase();

                    // Check limits
                    if ((unit === 'week' || unit === 'weeks') && quantity > 1) {
                        return await interaction.reply({ content: 'Schedule time cannot exceed 1 week.', ephemeral: true });
                    }
                    if ((unit === 'day' || unit === 'days') && quantity > 6) {
                        return await interaction.reply({ content: 'Schedule time cannot exceed 6 days. Consider using week (7 days).', ephemeral: true });
                    }
                    if ((unit === 'hour' || unit === 'hours') && quantity > 24) {
                        return await interaction.reply({ content: 'Schedule time cannot exceed 24 hours. Consider using days or week.', ephemeral: true });
                    }
                    if ((unit === 'week' || unit === 'weeks') && quantity < 1) {
                        return await interaction.reply({ content: 'Schedule time cannot go under 1 week. Consider using days or hours.', ephemeral: true });
                    }
                    if ((unit === 'day' || unit === 'days') && quantity < 1) {
                        return await interaction.reply({ content: 'Schedule time cannot go under 1 day. Consider using hours.', ephemeral: true });
                    }
                    if ((unit === 'hour' || unit === 'hours') && quantity < 1 || (unit === 'second' || unit === 'seconds' || unit === 'sec' || unit === 'secs' || unit === 'minute' || unit === 'minutes' || unit === 'min' || unit === 'mins')) {
                        return await interaction.reply({ content: 'Schedule time cannot go under 1 hour.', ephemeral: true });
                    }
                }
            }

            var listRows = await listAllRows();
            var JSONRow = JSON.stringify(listRows, null, 2);
            var parsedJSON = JSON.parse(JSONRow);
            var result = null;
            for (const key in parsedJSON) {
                var decryptedUserId = decryptData(parsedJSON[key].userId);
                var decryptedExpire = decryptData(parsedJSON[key].expirationTimestamp);
                var decryptedSchedule = decryptData(parsedJSON[key].schedule);

                if (decryptedUserId === interaction.user.id && reminderData.userId === parsedJSON[key].userId) {
                    if (newSchedule && newExpiration) {
                        newSchedule = await calculateSchedule(newSchedule, newExpiration);
                    }
                    else if (newSchedule) {
                        newSchedule = await calculateSchedule(newSchedule, decryptedExpire);
                    }
                    else if (newExpiration) {
                        newSchedule = await calculateSchedule(reverseSchedule(decryptedSchedule, decryptedExpire), newExpiration);
                    }

                    result = await updateRow(parsedJSON[key].userId, encryptData(newName), encryptData(newCoordinates), encryptData(newNL), encryptData(newSchedule), encryptData(newExpiration));

                    if (CacheManager.isReminderCached(`${parsedJSON[key].userId}-${parsedJSON[key].itemName}`)) {
                        CacheManager.removeTimeout(`${parsedJSON[key].userId}-${parsedJSON[key].itemName}`);
                        CacheManager.removeReminder(`${parsedJSON[key].userId}-${parsedJSON[key].itemName}`);
                    }
                    continue;
                }
            }

            if (result) {
                await interaction.reply({ content: 'Reminder updated successfully!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Failed to update reminder.', ephemeral: true });
            }
        }
    }
};