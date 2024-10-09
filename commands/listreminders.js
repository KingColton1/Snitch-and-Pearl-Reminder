const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { listAllRows } = require(`../events/databaseManager.js`);
const { decryptData } = require('../libs/encryption.js');
const embedPage = require('../libs/embedPage.js');

async function pageArray(array, page) {
    const itemsPerPage = 5;

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return array.slice(startIndex, endIndex);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listreminders')
		.setDescription('Show list of your reminders'),
	async execute(interaction) {
        const embeds = [];
        var list = [];

        var listRows = await listAllRows();
        var JSONRow = JSON.stringify(listRows, null, 2);
        var parsedJSON = JSON.parse(JSONRow);
        for (const key in parsedJSON) {
            list.push(decryptData(parsedJSON[key].description));
        }

        for (var i = 0; i < Math.ceil(list.length / 5); i++) {
            const pageItems = await pageArray(list, i + 1);
            embeds.push(new EmbedBuilder()
                .setTitle('Snitch/Pearl Name List')
                .setDescription(pageItems.join('\n')).setColor("Blurple"));
        }

        await embedPage(interaction, embeds)
    }
};