const { Events } = require('discord.js');
const { updateRow } = require(`./databaseManager.js`);
const { decryptData } = require('../libs/encryption.js');
const CacheManager = require('../libs/cacheManager.js');

// TO DO: Decrypt, match, then encrypt new value. Reset cache.

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId === 'editReminderModal') {
            const newName = interaction.fields.getTextInputValue('newName') || null;
            const newSchedule = interaction.fields.getTextInputValue('newSchedule') || null;
            const newExpiration = interaction.fields.getTextInputValue('newExpiration') || null;

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

                if (decryptedUserId === interaction.member.id && decryptedName.toLowerCase() === newName.toLowerCase() && decryptedCoord === newCoordinates) {
                    result = await updateRow(parsedJSON[key].userId, parsedJSON[key].itemName, parsedJSON[key].coordinate, parsedJSON[key].namelayerName, parsedJSON[key].schedule, parsedJSON[key].expirationTimestamp);
                    continue;
                }
                else if (decryptedUserId === interaction.member.id && decryptedName.toLowerCase() === newName.toLowerCase()) {
                    result = await updateRow(parsedJSON[key].userId, parsedJSON[key].itemName, null, null, parsedJSON[key].schedule, parsedJSON[key].expirationTimestamp);
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