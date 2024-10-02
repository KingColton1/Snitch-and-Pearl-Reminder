const dotenv = require('dotenv');
dotenv.config('./.env');

module.exports = {
    discordToken: process.env.TOKEN,
    discordClientId: process.env.CLIENT,
    storageType: process.env.STORAGE_TYPE,
    dbDatabase: process.env.DB_DATABASE,
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
    dbUser: process.env.DB_USER,
    dbPassword: process.env.DB_PASSWORD,
    sqliteFileName: process.env.SQLITE_FILE_NAME,
    sqliteDatabase: process.env.SQLITE_DATABASE,
    sqliteHost: process.env.SQLITE_HOST,
    sqliteUser: process.env.SQLITE_USER,
    sqlitePassword: process.env.SQLITE_PASSWORD
}