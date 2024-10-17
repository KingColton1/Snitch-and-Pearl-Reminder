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
        var listExpire = [];
        var listType = [];
        var listCoord = [];

        var listRows = await listAllRows();
        var JSONRow = JSON.stringify(listRows, null, 2);
        var parsedJSON = JSON.parse(JSONRow);
        for (const key in parsedJSON) {
            var decryptedUserId = decryptData(parsedJSON[key].userId);
            var decryptedDesc = decryptData(parsedJSON[key].description);
            var decryptedExpire = decryptData(parsedJSON[key].expirationTimestamp);
            var decryptedType = decryptData(parsedJSON[key].typeName);
            var decryptedCoord = decryptData(parsedJSON[key].coordinate);
            
            if (decryptedUserId === interaction.member.id) {
                list.push(decryptedDesc);
                listExpire.push(decryptedExpire);
                listType.push(decryptedType);
                listCoord.push(decryptedCoord);
            }
        }

        for (var i = 0; i < Math.ceil(list.length / 5); i++) {
            const pageItems = await pageArray(list, i + 1);
            const pageItems2 = await pageArray(listExpire, i + 1);
            const pageItems3 = await pageArray(listType, i + 1);
            const pageItems4 = await pageArray(listCoord, i + 1);
            embeds.push(new EmbedBuilder()
                .setTitle('Snitch/Pearl Name List')
                .addFields(
                    { name: 'Pearl/Snitch Name', value: pageItems.join('\n'), inline: true },
                    { name: 'Expiration', value: pageItems2.join('\n'), inline: true },
                    { name: 'Type', value: pageItems3.join('\n'), inline: true },
                    { name: 'Coords', value: pageItems4.join('\n'), inline: true }
                )
                .setColor("Blurple"));
        }

        await embedPage(interaction, embeds);
    }
};