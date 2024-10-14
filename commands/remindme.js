const { SlashCommandBuilder } = require('discord.js');
const { addRow } = require(`../events/databaseManager.js`);
const { encryptData } = require('../libs/encryption.js');
const { timeConverter, calculateSchedule } = require('../libs/timeConverter.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remindme')
		.setDescription('Create a snitch or pearl reminder for yourself')
        .addSubcommand(subcommand =>
            subcommand.setName('pearl')
            .setDescription('New reminder for pearl')
            .addStringOption(option =>
                option.setName('name')
                .setDescription('Input name of your pearl')
                .setRequired(true)
                .setMaxLength(255)
            )
            .addStringOption(option =>
                option.setName('expiration')
                .setDescription('Date and time of expiration (DD/MM/YYYY HH:MM) ex: 10/04/2024 20:15')
                .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('schedule-reminder')
                .setDescription('Choose a repetitive time or day to remind you before expiration')
                .setRequired(true)
                .addChoices(
                    { name: '5 days before', value: '5days' },
                    { name: '4 days before', value: '4days' },
                    { name: '3 days before', value: '3days' },
                    { name: '2 days before', value: '2days' },
                    { name: '1 day before', value: '1day' },
                    { name: '10 hours before', value: '10hours' },
                    { name: '5 hours before', value: '5hours' },
                    { name: '1 hour before', value: '1hour' },
                )
            )
            .addBooleanOption(option =>
                option.setName('dm')
                .setDescription('Do you want this bot to DM you to get reminded?')
                .setRequired(true)
            )
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('(If you choose false in DM part, do this) Choose a channel for this bot to post reminders')
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('snitch')
            .setDescription('New reminder for snitch')
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
            .addStringOption(option =>
                option.setName('expiration')
                .setDescription('Date and time of expiration (DD/MM/YYYY HH:MM) ex: 10/04/2024 20:15')
                .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('schedule-reminder')
                .setDescription('Choose a repetitive time or day to remind you before expiration')
                .setRequired(true)
                .addChoices(
                    { name: '1 week before', value: '1week' },
                    { name: '6 days before', value: '6days' },
                    { name: '5 days before', value: '5days' },
                    { name: '4 days before', value: '4days' },
                    { name: '3 days before', value: '3days' },
                    { name: '2 days before', value: '2days' },
                    { name: '1 day before', value: '1day' },
                    { name: '10 hours before', value: '10hours' },
                    { name: '5 hours before', value: '5hours' },
                    { name: '1 hour before', value: '1hour' },
                )
            )
            .addBooleanOption(option =>
                option.setName('dm')
                .setDescription('Do you want this bot to DM you to get reminded?')
                .setRequired(true)
            )
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('(If you choose false in DM part, do this) Choose a channel for this bot to post reminders')
            )
        ),
	async execute(interaction) {
        var message = '';

        // Get something from user's inputs
        var typeTarget = '';
        var nameTarget = '';
        var coordTarget = "0,0,0";
        var scheduleTarget = '';
        var dmTarget = true;
        var channelTarget = '';
        var expirationTarget = '';
        let submissionTimestamp = Math.floor(Date.now() / 1000);

        if (interaction.options.getSubcommand() === 'pearl') {
            typeTarget = "pearl";
            nameTarget = interaction.options.getString('name');
            scheduleTarget = interaction.options.getString('schedule-reminder');
            dmTarget = interaction.options.getBoolean('dm');
            channelTarget = interaction.options.getChannel('channel') || "0";
            expirationTarget = await timeConverter(interaction.options.getString('expiration'));

            if (expirationTarget === false) {
                return await interaction.reply({
                    content: "There is a problem with expiration format, please follow DD/MM/YYYY HH:MM format. For example: 20/04/2025 15:20",
                    ephemeral: true
                });
            }

            scheduleTarget = await calculateSchedule(scheduleTarget, expirationTarget);
        }
        else if (interaction.options.getSubcommand() === 'snitch') {
            typeTarget = "snitch";
            nameTarget = interaction.options.getString('name');
            coordTarget = interaction.options.getString('coordinate');
            scheduleTarget = interaction.options.getString('schedule-reminder');
            dmTarget = interaction.options.getBoolean('dm');
            channelTarget = interaction.options.getChannel('channel') || "0";
            expirationTarget = await timeConverter(interaction.options.getString('expiration'));

            if (expirationTarget === false) {
                return await interaction.reply({
                    content: "There is a problem with expiration format, please follow DD/MM/YYYY HH:MM format. For example: 20/04/2025 15:20",
                    ephemeral: true
                });
            }

            scheduleTarget = await calculateSchedule(scheduleTarget, expirationTarget);
        }

        // Encrypt inputs
        var encryptedUserId = encryptData(interaction.member.user.id);
        var encryptedServerId = encryptData(interaction.guild.id);
        var encryptedType = encryptData(typeTarget);
        var encryptedName = encryptData(nameTarget);
        var encryptedCoord = encryptData(coordTarget);
        var encryptedSchedule = encryptData(scheduleTarget);
        var encryptedDM = encryptData(dmTarget);
        var encryptedChannel = encryptData(channelTarget);
        var encryptedExpire = encryptData(expirationTarget);
        var encryptedSubmit = encryptData(submissionTimestamp);

        // Save them to the database
        let newRow = await addRow(encryptedUserId, encryptedServerId, encryptedType, encryptedName, encryptedCoord, encryptedSchedule, encryptedDM, encryptedChannel, encryptedSubmit, encryptedExpire);

        if (newRow == true) {
            message = `Your reminder for ${nameTarget} ${typeTarget} is created!`;
        }
        else {
            message = "Error creating reminder, try again later. \n\n" + newRow.toString();
        }

        await interaction.reply({
            content: message,
            ephemeral: true
        });
    }
};