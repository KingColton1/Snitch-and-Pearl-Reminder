const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('indexsnitch')
		.setDescription('Indexes every snitches in a selected channel. All coordinates are unique.'),
	async execute(interaction) {
        const message = '';

        await interaction.reply({
            content: message,
            ephemeral: true
        });
    }
};