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
		.setDescription('Show list of your reminders')
        .addSubcommand(subcommand =>
            subcommand.setName('pearl')
            .setDescription('Show all pearls')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('snitch')
            .setDescription('Show all snitches')
            .addStringOption(option =>
                option.setName('namelayer')
                .setDescription('(Optional) Show all snitches under a namelayer')
                .setMaxLength(255)
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('all')
            .setDescription('Show all (both pearl and snitch)')
        ),
	async execute(interaction) {
        const embeds = [];
        var namelayerTarget = interaction.options.getString('namelayer') || '';
        var chosenNL = '';
        var list = [];

        var listRows = await listAllRows();

        if (!listRows || listRows.length === 0) {
            embeds.push(new EmbedBuilder()
            .setTitle('Empty Reminders List')
            .setDescription(`<@${interaction.member.id}>, you have not add any reminders yet. Use /remindme to get started!`)
            .setColor("Red"));

            await embedPage(interaction, embeds, true);
            return;
        }

        var JSONRow = JSON.stringify(listRows, null, 2);
        var parsedJSON = JSON.parse(JSONRow);
        for (const key in parsedJSON) {
            var decryptedUserId = decryptData(parsedJSON[key].userId);
            var decryptedName = decryptData(parsedJSON[key].itemName);
            var decryptedType = decryptData(parsedJSON[key].typeName);
            var decryptedExpire = decryptData(parsedJSON[key].expirationTimestamp);
            var decryptedNL = decryptData(parsedJSON[key].namelayerName);
            var decryptedCoord = decryptData(parsedJSON[key].coordinate);
            
            if (decryptedUserId === interaction.member.id) {
                if (interaction.options.getSubcommand() === 'snitch') {
                    if (namelayerTarget !== '' && namelayerTarget !== null) {
                        if (namelayerTarget.toLowerCase() === decryptedNL.toLowerCase()) {
                            chosenNL = decryptedNL;

                            list.push({
                                name: decryptedName,
                                expire: decryptedExpire,
                                coords: decryptedCoord,
                                namelayer: chosenNL
                            });
                        }
                    }
                    else if (namelayerTarget.toLowerCase() !== decryptedNL.toLowerCase() && decryptedType !== 'pearl') {
                        list.push({
                            name: decryptedName,
                            expire: decryptedExpire,
                            coords: decryptedCoord,
                            namelayer: decryptedNL
                        });
                    }
                }
                else if (interaction.options.getSubcommand() === 'pearl' && decryptedType === 'pearl') {
                    list.push({
                        name: decryptedName,
                        expire: decryptedExpire,
                        coords: null,
                        namelayer: null
                    });
                }
                else if (interaction.options.getSubcommand() === 'all') {
                    list.push({
                        name: decryptedName,
                        expire: decryptedExpire,
                        coords: decryptedCoord !== '0,0,0' ? decryptedCoord : null,
                        namelayer: decryptedNL
                    });
                }
            }
        }

        // Sort 'em out by expiration timestamp
        list.sort((a, b) => a.expire - b.expire);

        for (var i = 0; i < Math.ceil(list.length / 5); i++) {
            const pageItems = await pageArray(list, i + 1);

            const nameField = pageItems.map(item => `${item.name}`).join('\n');
            const expireField = pageItems.map(item => `<t:${item.expire}:D>`).join('\n');
            const namelayerField = pageItems.map(item => `${item.namelayer ? item.namelayer : ''}${item.coords ? ' | ' + item.coords : ''}`).join('\n');

            if (interaction.options.getSubcommand() === 'pearl') {
                embeds.push(new EmbedBuilder()
                .setTitle('Pearl Reminders List')
                .addFields(
                    { name: 'Name', value: nameField, inline: true },
                    { name: 'Expiration', value: expireField, inline: true }
                )
                .setColor("Blurple"));
            }
            else if (interaction.options.getSubcommand() === 'snitch') {
                embeds.push(new EmbedBuilder()
                .setTitle('Snitch Reminders List')
                .addFields(
                    { name: 'Name', value: nameField, inline: true },
                    { name: 'Expiration', value: expireField, inline: true },
                    { name: 'Namelayer | Coords', value: namelayerField, inline: true }
                )
                .setColor("Blurple"));
            }
            else {
                embeds.push(new EmbedBuilder()
                .setTitle('All Reminders List')
                .addFields(
                    { name: 'Name', value: nameField, inline: true },
                    { name: 'Expiration', value: expireField, inline: true },
                    { name: 'Namelayer | Coords', value: namelayerField, inline: true }
                )
                .setColor("Blurple"));
            }
        }

        await embedPage(interaction, embeds);
    }
};