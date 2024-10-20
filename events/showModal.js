const { Events } = require('discord.js');
const { updateRow } = require(`./databaseManager.js`);

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId === 'editReminderModal') {
            const newName = interaction.fields.getTextInputValue('newName') || null;
            const newCoordinates = interaction.fields.getTextInputValue('newCoordinates') || null;
            const newNL = interaction.fields.getTextInputValue('newNL') || null;
            const newSchedule = interaction.fields.getTextInputValue('newSchedule') || null;
            const newExpiration = interaction.fields.getTextInputValue('newExpiration') || null;

            // Update the reminder with the new data
            const result = await updateRow(interaction.user.id, newName, newCoordinates, newNL, newSchedule, newExpiration);

            if (result) {
                await interaction.reply({ content: 'Reminder updated successfully!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Failed to update reminder.', ephemeral: true });
            }
        }
    }
};