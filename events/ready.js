const { Events, Client, ClientUser, Application } = require('discord.js');
const { connectDatabase } = require('./databaseManager')

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        // Connect to the database and create a template table if it doesn't exist yet
        await connectDatabase();
        console.log(`Logged in as ${client.user.tag}`);
    },
}