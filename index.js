const fs = require('node:fs');
const path = require('node:path');
const cron = require('node-cron');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes } = require('discord.js');
const { discordToken, discordClientId } = require('./libs/config.js');
const { remindEvent } = require('./events/remindEvent.js');
const { sendCrashNotice } = require('./events/crashHandler.js');

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions]});

client.commands = new Collection();
const cachedCommands = [];

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const file of commandFolders) {
    const commandsPath = path.join(foldersPath, file);
    const command = require(commandsPath);
    if('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        cachedCommands.push(command.data.toJSON()); // Caches commands
    } else {
        console.log(`[WARNING] The Command at ${commandsPath} is missing a required data or execute property.`);
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if(event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Refresh commands every time a bot start up
const rest = new REST().setToken(discordToken);
(async () => {
    try {
        console.log(`Started refreshing ${cachedCommands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(discordClientId),
            {body: cachedCommands}
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();

client.login(discordToken);

// Handling uncaught exceptions (sync code errors)
process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    await sendCrashNotice(client, error.message);
    process.exit(1);
});

// Handling unhandled promise rejections (async code errors)
process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection:', promise, 'reason:', reason);
    await sendCrashNotice(client, reason.message || reason);
    process.exit(1);
});

// Run interval, passing client information
cron.schedule('* * * * *', async () => {
    await remindEvent(client);
});