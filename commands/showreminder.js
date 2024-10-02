const { SlashCommandBuilder, Guild } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('showreminder')
		.setDescription('Show one of your snitch or pearl reminder'),
	async execute(interaction) {
        const message = '';

        await interaction.reply({
            content: message,
            ephemeral: true
        });
    }
};