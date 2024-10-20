const { Events } = require('discord.js');
const { listAllRows, updateRow } = require(`./databaseManager.js`);
const { encryptData, decryptData } = require('../libs/encryption.js');
const { timeConverter, calculateSchedule } = require('../libs/timeConverter.js');
const CacheManager = require('../libs/cacheManager.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId === 'editReminderModal') {
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
                var decryptedCoord = decryptData(parsedJSON[key].coordinate);

                console.log("test");

                if (decryptedUserId === interaction.member.id && decryptedName.toLowerCase() === newName.toLowerCase() && decryptedCoord === newCoordinates) {
                    if (newSchedule) {
                        newSchedule = await calculateSchedule(newSchedule, newExpiration);
                    }

                    result = await updateRow(parsedJSON[key].userId, encryptData(newName), encryptData(newCoordinates), encryptData(newNL), encryptData(newSchedule), encryptData(newExpiration));
                    console.log(result);
                    if (CacheManager.isReminderCached(`${parsedJSON[key].userId}-${parsedJSON[key].itemName}`)) {
                        CacheManager.removeTimeout(`${parsedJSON[key].userId}-${parsedJSON[key].itemName}`);
                        CacheManager.removeReminder(`${parsedJSON[key].userId}-${parsedJSON[key].itemName}`);
                    }
                    continue;
                }
                else if (decryptedUserId === interaction.member.id && decryptedName.toLowerCase() === newName.toLowerCase()) {
                    console.log("test in pearl if statement");
                    if (newSchedule) {
                        newSchedule = await calculateSchedule(newSchedule, newExpiration);
                    }

                    console.log("test processing");

                    result = await updateRow(parsedJSON[key].userId, encryptData(newName), null, null, encryptData(newSchedule), encryptData(newExpiration));
                    console.log(result);
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