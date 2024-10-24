# Snitch and Pearl Reminder Bot

Snitch and Pearl Reminder Bot, or simply Reminder Bot, is a self-hostable bot designed to ensure your snitches and pearls are maintained in a timely manner. Do note that the bot's timing for snitches and pearls may be slightly inaccurate because you create reminders manually. It can be 5 minutes later than the actual expiration time for a snitch or pearl. Be sure to time it right or at least accurately!

This bot is designed for any Civ server, such as CivMC, that is using mainline's pearl and snitch plugins. It should also probably work for spin-off Civ servers like Civ+.

**Note:** Expiration Date defines the day of a snitch's deactivation or running out of a pearl's fuel.

For more information, please refer to [the wiki](https://github.com/KingColton1/Snitch-and-Pearl-Reminder/wiki).

# Self Host Instruction
This bot requires two things: a server (it can be your own computer, a virtual private server, or a dedicated server) and a database if you prefer Postgres, MySQL, MariaDB, or MSSQL. However, if you prefer SQLite over other databases, you do not need to host your own database.

Also, this bot requires **presence intent**, **server members intent**, and **message content intent** for this bot to function. Be sure to create an application in [Discord Developer Portal](https://discord.com/developers/applications).

(This step-by-step list requires command line knowledge, but it can be used in any OS if NodeJS and NPM are supported in your OS)
1. Install [NodeJS](https://nodejs.org/en/download/package-manager) (It should come with NPM, otherwise install NPM), has to be at least NodeJS 18 or up.
2. Run `git clone https://github.com/KingColton1/Snitch-and-Pearl-Reminder.git` to clone this repo into your server.
3. Run `npm install` to install required packages and dependencies.
4. Rename `.env.example` to `.env` and input necessary information in `.env` in order to run this bot.
5. If you choose Postgres, MySQL, MariaDB, or MSSQL as your storage type, create a new database and user and add the names of the database and user to `.env`.
6. Run `node index.js`
7. Start adding your reminds.

If you are using [Pterodactyl](https://pterodactyl.io/), [Pelican](https://pelican.dev/), [AMP](https://cubecoders.com/AMP), or other server management softwares that support running NodeJS, follow this:
1. Put `https://github.com/KingColton1/Snitch-and-Pearl-Reminder.git` in Git Repo Address.
2. Put `master` in Install Branch.
3. Put `index.js` in Main File.
4. Optionally, you can turn on auto-update to receive automatic updates for fixes or improvements. Otherwise, don't turn on auto-update.
5. Rename `.env.example` to `.env` and input necessary information in `.env` in order to run this bot.
6. If you choose Postgres, MySQL, MariaDB, or MSSQL as your storage type, create a new database and user and add the names of the database and user to `.env`.
7. Start your bot.
8. Start adding your reminds.

If you are using one of Discord Bot hosting services (such as BisectHosting and PebbleHost), these are the same steps as the server management software steps (just above).

# Inviting my bot
If you don't want to self-host and instead use my bot, you may use that at the expense of using the database I host.

1. [Click here to invite Discord Bot](https://discord.com/oauth2/authorize?client_id=1298235484484538449&permissions=277025475584&integration_type=0&scope=bot).
2. Set up the necessary channel permissions for the bot to see and post. Alternatively, your bot can DM you to remind you.
3. Start adding your reminds.

### Notes
- If you plan to index everything in your snitch channel, run `/indexsnitch <channel name>`. It will automatically add everything based on snitches' coordinates (every snitch's coordinates are unique); they all are assigned to you and an associated namelayer.
-  If you include both jukebox and noteblock in the same snitch channel and namelayer when you run the `/indexsnitch` command, you need to modify jukebox (assuming you set up a small number of jukeboxes) to change the expiration date as well as the name of it so the bot can correctly remind you before the jukeboxes' expiration dates. The command to modify a snitch reminder is `/editreminder snitch <name> <coordinate>`.

[Click here for more information about commands.](https://github.com/KingColton1/Snitch-and-Pearl-Reminder/wiki)

# Data Privacy
All data in any database (hosted by me or you) are encrypted to protect users' privacy because it contains snitch's coordinates, pearl time, server ID, and user ID. This security feature is included in the self-host version and the bot I host. You may check out how encryption works in [./libs/encrpytion.js](https://github.com/KingColton1/Snitch-and-Pearl-Reminder/blob/main/libs/encryption.js).

# Contributions
Contributions to this repo are greatly appreciated, as I've been constantly improving to improve this bot. The goal is to create a reliable Civ Reminder bot that helps us maintain our snitches and pearls. Please open a new pull request, which I will review before I approve and merge. Some rules are expected to follow;
- Do not massively modify databaseManager.js unless you figured out a way to automatically create a new database for all 4 databases other than SQLite
- Do not modify encryption.js unless you provide a valid reason that can legitimately improve security.
- Factoring and optimizing codes to improve performance is OK and should not dramatically change how the civ reminder bot works unless necessary.
