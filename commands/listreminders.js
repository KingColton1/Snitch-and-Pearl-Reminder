const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { listAllRows } = require(`../events/databaseManager.js`);
const { decryptData } = require('../libs/encryption.js');
const embedPage = require('../libs/embedPage.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listreminders')
		.setDescription('Show list of your reminders'),
	async execute(interaction) {
        const embeds = [];
        var list = [];

        // Decrypt test
        var listRows = await listAllRows();
        var JSONRow = JSON.stringify(listRows, null, 2);
        var parsedJSON = JSON.parse(JSONRow);
        for (const key in parsedJSON) {
            list.push(decryptData(parsedJSON[key].description));
        }

        for (var i = 0; i < list.length; i++) {
            embeds.push(new EmbedBuilder().setDescription(`Snitch/Pearl Name: ${list[i]}`).setColor("Blurple"));
        }

        await embedPage(interaction, embeds)
    }
};