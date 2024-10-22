const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
        )
        .addSubcommand(subcommand =>
            subcommand.setName('bulk')
            .setDescription('Choose a bulk of snitch reminder to be removed using namelayer')
            .addStringOption(option =>
                option.setName('namelayer')
                .setDescription('Input your namelayer that is associated to your snitches')
                .setRequired(true)
                .setMaxLength(255)
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('all')
            .setDescription('!!DANGER!! Remove all of your reminder data owned by you (snitch and pearl reminders).')
        ),
	async execute(interaction) {
        var nameTarget = interaction.options.getString('name');
        var coordTarget = interaction.options.getString('coordinate');
        var namelayerTarget = interaction.options.getString('namelayer');
        var chosenName = '';
        var chosenCoord = '';
        var isSuccess = false;
        var message = '';

        const rows = await listAllRows();

        // Handle the "all" subcommand for removing all reminders
        if (interaction.options.getSubcommand() === 'all') {
            const confirmRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirm')
                        .setLabel('Yes, delete all')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('cancel')
                        .setLabel('No, cancel')
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.reply({
                content: '⚠️ Are you sure you want to remove **all** of your reminders? This action cannot be undone!',
                components: [confirmRow],
                ephemeral: true
            });

            const filter = i => i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

            collector.on('collect', async i => {
                if (i.customId === 'confirm') {
                    // Proceed with deleting all reminders
                    for (const row of rows) {
                        var userId = decryptData(row.userId);
                        if (userId === interaction.member.id) {
                            isSuccess = deleteRow(null, null, row.userId, null);
                            CacheManager.removeTimeout(`${row.userId}-${row.itemName}`);
                            CacheManager.removeReminder(`${row.userId}-${row.itemName}`);
                        }
                    }
                    await i.update({ content: 'All your reminders have been removed.', components: [] });
                } else if (i.customId === 'cancel') {
                    await i.update({ content: 'Action cancelled. Your reminders are safe.', components: [] });
                }
            });

            collector.on('end', collected => {
                if (!collected.size) {
                    interaction.editReply({ content: 'No response, action cancelled.', components: [] });
                }
            });

            return;
        }

        for (const row of rows) {
            var userId = decryptData(row.userId) || 0;
            var itemName = decryptData(row.itemName) || 'undefined name';
            var coordinate = decryptData(row.coordinate) || '0,0,0';
            var namelayerName = decryptData(row.namelayerName) || 'undefined';

            if (userId === interaction.user.id) {
                if (interaction.options.getSubcommand() === 'snitch') {
                    if (itemName.toLowerCase() === nameTarget.toLowerCase() && coordinate === coordTarget ) {
                        console.log("Trying to delete a snitch reminder...");
                        chosenName = itemName;
                        chosenCoord = coordinate;
                        isSuccess = deleteRow(null, row.coordinate, null, null);
                        CacheManager.removeTimeout(`${row.userId}-${row.itemName}`);
                        CacheManager.removeReminder(`${row.userId}-${row.itemName}`);
                        continue;
                    }
                }
                else if (interaction.options.getSubcommand() === 'pearl') {
                    if (itemName.toLowerCase() === nameTarget.toLowerCase()) {
                        console.log("Trying to delete a pearl reminder...");
                        chosenName = itemName;
                        isSuccess = deleteRow(row.itemName, null, null, null);
                        CacheManager.removeTimeout(`${row.userId}-${row.itemName}`);
                        CacheManager.removeReminder(`${row.userId}-${row.itemName}`);
                        continue;
                    }
                }
                else if (interaction.options.getSubcommand() === 'bulk') {
                    if (namelayerName.toLowerCase() === namelayerTarget.toLowerCase()) {
                        console.log(`Trying to delete all reminders associated to ${namelayerName}...`);
                        chosenName = itemName;
                        isSuccess = deleteRow(null, null, null, row.namelayerName);
                        CacheManager.removeTimeout(`${row.userId}-${row.itemName}`);
                        CacheManager.removeReminder(`${row.userId}-${row.itemName}`);
                        continue;
                    }
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