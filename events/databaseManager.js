const sequelize = require('sequelize');
const { storageType, dbDatabase, dbHost, dbPort, dbUser, dbPassword, sqliteFileName, sqliteDatabase, sqliteHost, sqliteUser, sqlitePassword } = require('../libs/config.js');

function connectDatabase() {
    let dbConn = null;
    if (storageType == "sqlite") {
        dbConn = new sequelize(sqliteDatabase, sqliteUser, sqlitePassword, {
            host: sqliteHost,
            dialect: storageType,
            logging: false,
            
            // SQLite only
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

    createTemplateTable(dbConn);
}

function createTemplateTable(dbConn) {
    // Create a template table on startup. With Sequelize, it is virtually supported on any database engines.
    // Same as "CREATE TABLE" command
    const UserReminder = dbConn.define('UserReminder', {
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
        coordinate: {
            type: sequelize.STRING,
            defaultValue: "0"
        },
        submissionTimestamp: {
            type: sequelize.INTEGER,
            defaultValue: 0
        },
        expirationTimestamp: {
            type: sequelize.INTEGER,
            defaultValue: 0
        }
    });

    UserReminder.sync();
}

module.exports = {
    connectDatabase,
}