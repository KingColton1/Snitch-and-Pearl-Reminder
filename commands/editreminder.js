const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { listAllRows } = require(`../events/databaseManager.js`);
const { decryptData } = require('../libs/encryption.js');
const { unixToTimestamp, reverseSchedule } = require('../libs/timeConverter.js');
const { v4: uuidv4 } = require('uuid');
const TempStorage = require('../libs/tempStorage.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('editreminder')
		.setDescription('Edit one of your snitch or pearl reminder')
        .addSubcommand(subcommand =>
            subcommand.setName('pearl')
            .setDescription('Edit a pearl reminder')
            .addStringOption(option =>
                option.setName('name')
                .setDescription('Input name of your pearl')
                .setRequired(true)
                .setMaxLength(255)
            )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('snitch')
            .setDescription('Edit a snitch reminder')
            .addStringOption(option =>
                option.setName('name')
                .setDescription('Input name of your pearl')
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
        var coordTarget = interaction.options.getString('coordinate') || null;
        var list = [];
        var selectedUserId = null;
        var selectedName = null;
        const uniqueId = uuidv4();

        var listRows = await listAllRows();
        var JSONRow = JSON.stringify(listRows, null, 2);
        var parsedJSON = JSON.parse(JSONRow);
        for (const key in parsedJSON) {
            var decryptedUserId = decryptData(parsedJSON[key].userId);
            var decryptedName = decryptData(parsedJSON[key].itemName);
            var decryptedType = decryptData(parsedJSON[key].typeName);
            var scheduleTime = decryptData(parsedJSON[key].schedule);
            var decryptedExpire = decryptData(parsedJSON[key].expirationTimestamp);
            var decryptedNL = decryptData(parsedJSON[key].namelayerName);
            var decryptedCoord = decryptData(parsedJSON[key].coordinate);

            if (decryptedUserId === interaction.user.id && decryptedName.toLowerCase() === nameTarget.toLowerCase() && interaction.options.getSubcommand() === 'pearl' && decryptedType === 'pearl') {
                selectedUserId = parsedJSON[key].userId;
                selectedName = parsedJSON[key].itemName;
                list.push(decryptedName, scheduleTime, decryptedExpire);
            }
            else if (decryptedUserId === interaction.user.id && decryptedName.toLowerCase() === nameTarget.toLowerCase() && decryptedCoord === coordTarget && interaction.options.getSubcommand() === 'snitch' && decryptedType === 'snitch') {
                selectedUserId = parsedJSON[key].userId;
                selectedName = parsedJSON[key].itemName;
                list.push(decryptedName, scheduleTime, decryptedExpire, decryptedNL, decryptedCoord);
            }
        }

        TempStorage.set(uniqueId, { userId: selectedUserId, itemName: selectedName });

        // Show a modal for the user to edit the fields
        const modal = new ModalBuilder()
            .setCustomId(`editReminderModal=${uniqueId}`)
            .setTitle('Edit Reminder');

        // Create input fields
        const nameInput = new TextInputBuilder()
            .setCustomId('newName')
            .setLabel('Edit Name (optional)')
            .setPlaceholder(list[0])
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const scheduleInput = new TextInputBuilder()
            .setCustomId('newSchedule')
            .setLabel('Edit Schedule (optional, X hour(s) or X week)')
            .setPlaceholder(reverseSchedule(list[1], list[2]))
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const expirationInput = new TextInputBuilder()
            .setCustomId('newExpiration')
            .setLabel('Edit Expiration Time (optional)')
            .setPlaceholder(unixToTimestamp(list[2]))
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

            const row1 = new ActionRowBuilder().addComponents(nameInput);
            const row2 = new ActionRowBuilder().addComponents(scheduleInput);
            const row3 = new ActionRowBuilder().addComponents(expirationInput);
            modal.addComponents(row1, row2, row3);

        if (interaction.options.getSubcommand() === 'snitch') {
            const coordinateInput = new TextInputBuilder()
                .setCustomId('newCoordinates')
                .setLabel('Edit Coordinates (optional)')
                .setPlaceholder(list[4])
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const namelayerInput = new TextInputBuilder()
                .setCustomId('newNL')
                .setLabel('Edit Namelayer (optional)')
                .setPlaceholder(list[3])
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const row4 = new ActionRowBuilder().addComponents(namelayerInput);
            const row5 = new ActionRowBuilder().addComponents(coordinateInput);
            modal.addComponents(row4, row5);
        }

        // Show the modal to the user
        await interaction.showModal(modal);
    }
};