const { SlashCommandBuilder, Guild } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listreminders')
		.setDescription('Show list of your reminders'),
	async execute(interaction) {
        const message = '';

        await interaction.reply({
            content: message,
            ephemeral: true
        });
    }
};