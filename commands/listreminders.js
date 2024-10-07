const { SlashCommandBuilder, Guild } = require('discord.js');
const { listAllRows } = require(`../events/databaseManager.js`);
const { decryptData } = require('../libs/encryption.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listreminders')
		.setDescription('Show list of your reminders'),
	async execute(interaction) {
        var message = '';
        var list = [];

        // Decrypt test
        var listRows = await listAllRows();
        var JSONRow = JSON.stringify(listRows, null, 2);
        var parsedJSON = JSON.parse(JSONRow);
        for (const key in parsedJSON) {
            list.push(decryptData(parsedJSON[key].description));
        }

        message = list.toString();

        await interaction.reply({
            content: message,
            ephemeral: true
        });
    }
};