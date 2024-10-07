const { SlashCommandBuilder, Guild } = require('discord.js');
const { addRow } = require(`../events/databaseManager.js`);
const { encryptData } = require('../libs/encryption.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remindme')
		.setDescription('Create a snitch or pearl reminder for yourself')
        .addStringOption(option =>
            option.setName('type')
            .setDescription('Choose reminder type: snitch or pearl')
            .setRequired(true)
            .addChoices(
				{ name: 'Snitch', value: 'snitch' },
				{ name: 'Pearl', value: 'pearl' }
			)
        )
        .addStringOption(option =>
            option.setName('name')
            .setDescription('Input name of your snitch or pearl')
            .setRequired(true)
            .setMaxLength(255)
        )
        .addStringOption(option =>
            option.setName('expiration')
            .setDescription('Date and time of expiration (DD/MM/YYYY HH:MM)')
            .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('coordinate')
            .setDescription('Coordinate of your snitch')
        ),
	async execute(interaction) {
        var message = '';

        // Get something from user's inputs
        var typeTarget = interaction.options.getString('type');
        var nameTarget = interaction.options.getString('name');
        var coordTarget = interaction.options.getString('coordinate');
        var expirationTarget = interaction.options.getString('expiration');
        let submissionTimestamp = Math.floor(Date.now() / 1000);

        // Encrypt inputs
        var encryptedUserId = encryptData(interaction.member.user.id);
        var encryptedServerId = encryptData(interaction.guild.id);
        var encryptedType = encryptData(typeTarget);
        var encryptedName = encryptData(nameTarget);
        var encryptedCoord = encryptData(coordTarget);
        var encryptedExpire = encryptData(expirationTarget);
        var encryptedSubmit = encryptData(submissionTimestamp);

        // Save them to the database
        let newRow = await addRow(encryptedUserId, encryptedServerId, encryptedType, encryptedName, encryptedCoord, encryptedExpire, encryptedSubmit);

        if (newRow == true) {
            message = `Your reminder for ${nameTarget} ${typeTarget} is created!`;
        }
        else {
            message = newRow;
        }

        await interaction.reply({
            content: message,
            ephemeral: true
        });
    }
};