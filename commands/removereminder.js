const { SlashCommandBuilder } = require('discord.js');
const { listAllRows, deleteRow } = require(`../events/databaseManager.js`);
const { decryptData } = require('../libs/encryption.js');
const CacheManager = require('../libs/cacheManager.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removereminder')
		.setDescription('Remove one of your snitch or pearl reminder')
        .addSubcommand(subcommand =>
            subcommand.setName('pearl')
            .setDescription('Choose pearl reminder to be removed')
            .addStringOption(option =>
                option.setName('name')
                .setDescription('Input name of your pearl')
                .setRequired(true)
                .setMaxLength(255)
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('snitch')
            .setDescription('Choose snitch reminder to be removed')
            .addStringOption(option =>
                option.setName('name')
                .setDescription('Input name of your snitch')
                .setRequired(true)
                .setMaxLength(255)
            )
            .addStringOption(option =>
                option.setName('coordinate')
                .setDescription('Coordinate of your snitch')
                .setRequired(true)
            )
        ),
	async execute(interaction) {
        var nameTarget = interaction.options.getString('name');
        var coordTarget = interaction.options.getString('coordinate');
        var chosenName = '';
        var chosenCoord = '';
        var isSuccess = false;
        var message = '';

        const rows = await listAllRows();

        for (const row of rows) {
            var userId = decryptData(row.userId) || 0;
            var itemName = decryptData(row.itemName) || 'undefined name';
            var coordinate = decryptData(row.coordinate) || '0,0,0';

            if (userId === interaction.member.id) {
                if (itemName.toLowerCase() === nameTarget.toLowerCase() && coordinate === coordTarget && interaction.options.getSubcommand() === 'snitch') {
                    console.log("Trying to delete a snitch reminder...");
                    chosenName = itemName;
                    chosenCoord = coordinate;
                    isSuccess = deleteRow(null, row.coordinate);
                    CacheManager.removeTimeout(`${row.userId}-${row.itemName}`);
                    CacheManager.removeReminder(`${row.userId}-${row.itemName}`);
                    continue;
                }
                else if (itemName.toLowerCase() === nameTarget.toLowerCase() && interaction.options.getSubcommand() === 'pearl') {
                    console.log("Trying to delete a pearl reminder...");
                    chosenName = itemName;
                    isSuccess = deleteRow(row.itemName, null);
                    CacheManager.removeTimeout(`${row.userId}-${row.itemName}`);
                    CacheManager.removeReminder(`${row.userId}-${row.itemName}`);
                    continue;
                }
            }
        }

        if (isSuccess) {
            if (interaction.options.getSubcommand() === 'snitch') {
                message = `${chosenName} at ${chosenCoord} is removed from your reminder list! I will not remind you about that snitch.`;
            }
            else if (interaction.options.getSubcommand() === 'pearl') {
                message = `${chosenName} is removed from your reminder list! I will not remind you about that pearl.`;
            }
        }
        else {
            message = `There is a problem with removing ${nameTarget}, please check your input.`;
        }

        await interaction.reply({
            content: message,
            ephemeral: true
        });
    }
};