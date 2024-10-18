const { SlashCommandBuilder } = require('discord.js');
const { listAllRows } = require(`../events/databaseManager.js`);
const { decryptData } = require('../libs/encryption.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('showreminder')
		.setDescription('Show one of your snitch or pearl reminder')
        .addStringOption(option =>
            option.setName('name')
            .setDescription('Input name of your snitch or pearl to look up')
            .setRequired(true)
            .setMaxLength(255)
        )
        .addStringOption(option =>
            option.setName('coordinate')
            .setDescription('(Optional) Coordinate of your snitch if you have multiple snitches using same names')
        ),
	async execute(interaction) {
        const nameTarget = interaction.options.getString('name');
        const coordTarget = interaction.options.getString('coordinate');
        var message = '';
        var list = [];

        var listRows = await listAllRows();
        var JSONRow = JSON.stringify(listRows, null, 2);
        var parsedJSON = JSON.parse(JSONRow);
        for (const key in parsedJSON) {
            var decryptedUserId = decryptData(parsedJSON[key].userId);
            var decryptedName = decryptData(parsedJSON[key].itemName);
            var decryptedType = decryptData(parsedJSON[key].typeName);
            var scheduleTime = decryptData(parsedJSON[key].schedule);
            var decryptedSubmit = decryptData(parsedJSON[key].submissionTimestamp);
            var decryptedExpire = decryptData(parsedJSON[key].expirationTimestamp);
            var decryptedCoord = decryptData(parsedJSON[key].coordinate);

            // If user's input matches a decrypted data, push everything related to a chosen row to list
            if (decryptedUserId === interaction.member.id && (decryptedName.toLowerCase() === nameTarget.toLowerCase() || decryptedCoord === coordTarget)) {
                list.push(decryptedName, decryptedType, scheduleTime, decryptedSubmit, decryptedExpire, decryptedCoord);
            }
        }

        if ((list[0] != null && list[3] != null) || list[0] != null) {
            message = "`" + list[0] + "` " + `${list[1]} is expiring in <t:${list[4]}:R>, you will be reminded <t:${list[2]}:R>`;
        }
        else {
            if (coordTarget && nameTarget) {
                message = "`" + nameTarget + "` and `" + coordTarget + "` coordinate are not found, please try again (double check what you typed).";
            }
            else {
                message = "`" + nameTarget + "` is not found, please try again (double check what you typed).";
            }
        }

        await interaction.reply({
            content: message,
            ephemeral: true
        });
    }
};