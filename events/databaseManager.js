const sequelize = require('sequelize');
const { storageType, dbDatabase, dbHost, dbPort, dbUser, dbPassword, sqliteFileName, sqliteDatabase, sqliteHost, sqliteUser, sqlitePassword } = require('../libs/config.js');
let dbConn = null;
let userReminderTable = null;

async function connectDatabase() {
    if (storageType == "sqlite") {
        dbConn = new sequelize(sqliteDatabase, sqliteUser, sqlitePassword, {
            host: sqliteHost,
            dialect: storageType,
            logging: false,
            storage: sqliteFileName
        })
    }
    else {
        dbConn = new sequelize(dbDatabase, dbUser, dbPassword, {
            host: dbHost,
            port: dbPort,
            dialect: storageType,
            logging: false
        })
    }
    await createTemplateTable(dbConn);
}

async function createTemplateTable(dbConn) {
    // Create a template table on startup. With Sequelize, it is virtually supported on any database engines.
    // Same as "CREATE TABLE" command
    userReminderTable = dbConn.define('UserReminders', {
        userId: {
            type: sequelize.STRING,
            allowNull: false
        },
        serverId: {
            type: sequelize.STRING,
            allowNull: false
        },
        typeName: sequelize.STRING,
        itemName: sequelize.STRING,
        namelayerName: sequelize.STRING,
        coordinate: sequelize.STRING,
        schedule: sequelize.STRING,
        isDMEnabled: sequelize.STRING,
        channelId: sequelize.STRING,
        submissionTimestamp: {
            type: sequelize.STRING,
            defaultValue: 0
        },
        expirationTimestamp: {
            type: sequelize.STRING,
            defaultValue: 0
        }
    });

    userReminderTable.sync();
}

async function addRow(tagUserId, tagServerId, tagTypeName, tagName, tagNL, tagCoord, tagSchedule, tagDM, tagChannel, tagSubmission, tagExpiration) {
    try {
        // Equivalent to: INSERT INTO UserReminder (userId, serverId, typeName) values (?, ?, ?);
        const row = await userReminderTable.create({
            userId: tagUserId,
            serverId: tagServerId,
            typeName: tagTypeName,
            itemName: tagName,
            namelayerName: tagNL,
            coordinate: tagCoord,
            schedule: tagSchedule,
            isDMEnabled: tagDM,
            channelId: tagChannel,
            submissionTimestamp: tagSubmission,
            expirationTimestamp: tagExpiration
        });

        return true;
    }
    catch (error) {
        return error;
    }
}

async function selectRow(tagUserId, tagName, tagCoord) {
    const row = null;

    // Equivalent to: SELECT * FROM UserReminder WHERE itemName = 'tagName' LIMIT 1;
    if (tagName) {
        row = await userReminderTable.findOne({ where: { itemName: tagName } });
    }
    else if (tagCoord) {
        row = await userReminderTable.findOne({ where: { coordinate: tagCoord } });
    }

    if (row) {
        // Equivalent to: UPDATE UserReminder SET usage_count = usage_count + 1 WHERE itemName = 'tagName';
        row.increment('usage_count');

        return row.get('expirationTimestamp')
    }
    else {
        return false;
    }
}

async function updateRow(tagUserId, tagName, tagCoord, tagNL, tagSchedule, tagExpiration) {
    const updateData = {};

    if (tagName) updateData.itemName = tagName;
    if (tagCoord) updateData.coordinate = tagCoord;
    if (tagNL) updateData.namelayerName = tagNL;
    if (tagSchedule) updateData.schedule = tagSchedule;
    if (tagExpiration) updateData.expirationTimestamp = tagExpiration;

    try {
        const [row] = await userReminderTable.update(updateData, { where: { userId: tagUserId } });
        return row > 0;
    }
    catch (err) {
        return false;
    }
}

async function updateTimeoutRow(tagName, tagTimeOutInterval) {
    const row = null;

    // Equivalent to: UPDATE UserReminder (isOnTimeOutInterval) values (?) WHERE itemName='?';
    if (tagName) {
        row = await userReminderTable.update({ isOnTimeOutInterval: tagTimeOutInterval }, { where: { itemName: tagName } });
    }

    if (row > 0) {
		return true;
	}
    else {
        return false;
    }
}

async function listAllRows() {
    const row = await userReminderTable.findAll();
    //const rowString = row.map(t => t.name).join(', ') || 'No data set.';

    return row;
}

async function deleteRow(tagName, tagCoord, tagUserId, tagNL) {
    var row = null;

    // Equivalent to: DELETE from UserReminder WHERE itemName = ?;
    if (tagName !== null && tagName !== "") {
        row = await userReminderTable.destroy({ where: { itemName: tagName } });
    }
    else if (tagCoord !== null && tagCoord !== "") {
        row = await userReminderTable.destroy({ where: { coordinate: tagCoord } });
    }
    else if (tagUserId !== null && tagUserId !== "") {
        row = await userReminderTable.destroy({ where: { userId: tagUserId } });
    }
    else if (tagNL !== null && tagNL !== "") {
        row = await userReminderTable.destroy({ where: { namelayerName: tagNL } });
    }

    if (!row) {
        return false;
    }
    else {
        return true;
    }
}

module.exports = {
    connectDatabase,
    addRow,
    selectRow,
    updateRow,
    updateTimeoutRow,
    listAllRows,
    deleteRow
}