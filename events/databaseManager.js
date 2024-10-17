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
    userReminderTable = dbConn.define('UserReminder', {
        userId: {
            type: sequelize.INTEGER,
            allowNull: false
        },
        serverId: {
            type: sequelize.INTEGER,
            allowNull: false
        },
        typeName: sequelize.STRING,
        description: sequelize.STRING,
        coordinate: sequelize.STRING,
        schedule: sequelize.STRING,
        isDMEnabled: sequelize.BOOLEAN,
        channelId: sequelize.INTEGER,
        submissionTimestamp: {
            type: sequelize.INTEGER,
            defaultValue: 0
        },
        expirationTimestamp: {
            type: sequelize.INTEGER,
            defaultValue: 0
        }
    });

    userReminderTable.sync();
}

async function addRow(tagUserId, tagServerId, tagTypeName, tagDesc, tagCoord, tagSchedule, tagDM, tagChannel, tagSubmission, tagExpiration) {
    try {
        // Equivalent to: INSERT INTO UserReminder (userId, serverId, typeName) values (?, ?, ?);
        const row = await userReminderTable.create({
            userId: tagUserId,
            serverId: tagServerId,
            typeName: tagTypeName,
            description: tagDesc,
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

async function selectRow(tagUserId, tagDesc, tagCoord) {
    const row = null;

    // Equivalent to: SELECT * FROM UserReminder WHERE description = 'tagDesc' LIMIT 1;
    if (tagDesc) {
        row = await userReminderTable.findOne({ where: { description: tagDesc } });
    }
    else if (tagCoord) {
        row = await userReminderTable.findOne({ where: { coordinate: tagCoord } });
    }

    if (row) {
        // Equivalent to: UPDATE UserReminder SET usage_count = usage_count + 1 WHERE description = 'tagDesc';
        row.increment('usage_count');

        return row.get('expirationTimestamp')
    }
    else {
        return false;
    }
}

async function updateRow(tagUserId, tagDesc, tagCoord, tagTypeName) {
    const row = null;

    // Equivalent to: UPDATE UserReminder (typeName) values (?) WHERE description='?';
    if (tagDesc) {
        row = await userReminderTable.update({ typeName: tagTypeName }, { where: { description: tagDesc } });
    }
    else if (tagCoord) {
        row = await userReminderTable.update({ typeName: tagTypeName }, { where: { coordinate: tagCoord } });
    }

    if (row > 0) {
		return true;
	}
    else {
        return false;
    }
}

async function updateTimeoutRow(tagDesc, tagTimeOutInterval) {
    const row = null;

    // Equivalent to: UPDATE UserReminder (isOnTimeOutInterval) values (?) WHERE description='?';
    if (tagDesc) {
        row = await userReminderTable.update({ isOnTimeOutInterval: tagTimeOutInterval }, { where: { description: tagDesc } });
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

async function deleteRow(tagUserId, tagDesc, tagCoord) {
    const row = null;

    // Equivalent to: DELETE from UserReminder WHERE description = ?;
    if (tagDesc) {
        row = await userReminderTable.destroy({ where: { description: tagDesc } });
    }
    else if (tagCoord) {
        row = await userReminderTable.destroy({ where: { coordinate: tagCoord } });
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