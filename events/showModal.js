const { Events } = require('discord.js');
const { listAllRows, updateRow } = require(`./databaseManager.js`);
const { encryptData, decryptData } = require('../libs/encryption.js');
const { timeConverter, calculateSchedule } = require('../libs/timeConverter.js');
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
            const newSchedule = interaction.fields.getTextInputValue('newSchedule') || null;
            const newExpiration = await timeConverter(interaction.fields.getTextInputValue('newExpiration')) || null;

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

            var listRows = await listAllRows();
            var JSONRow = JSON.stringify(listRows, null, 2);
            var parsedJSON = JSON.parse(JSONRow);
            var result = null;
            for (const key in parsedJSON) {
                var decryptedUserId = decryptData(parsedJSON[key].userId);
                var decryptedName = decryptData(parsedJSON[key].itemName);

                if (decryptedUserId === interaction.member.id && reminderData.userId === parsedJSON[key].userId) {
                    if (newSchedule) {
                        newSchedule = await calculateSchedule(newSchedule, newExpiration);
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