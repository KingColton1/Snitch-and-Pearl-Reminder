# Snitch and Pearl Reminder Bot

Snitch and Pearl Reminder Bot, or simply Reminder Bot is a self hostable bot designed to ensure your snitches and pearls are maintained with timely manner. Do note that the bot's timing for snitch and pearl may be slightly inaccurate because you create reminders manually. It can be 5 minutes later than the actual expiration time for a snitch or pearl. Be sure to time it right or at least accurately!

This bot designed for any Civ servers such as CivMC that is using mainline's pearl and snitch plugins. Probably work for spin-off Civ servers like Civ+.

# Self Host Instruction
This bot requires two things; a server (can be your own computer, a virtual private server, or dedicated server) and a database if you prefer Postgres, MySQL, MariaDB, or MSSQL. However if you prefer SQLite over other databases, you do not need to host your own database.

Also, this bot requires **presence intent**, **server members intent**, and **message content intent** in order for this bot to function. Be sure to create a application in [Discord Developer Portal](https://discord.com/developers/applications).

(This step-by-step list requires command line knowledge, but it can be used in any OS as long as NodeJS and NPM are supported in a OS you're using)
1. Install [NodeJS](https://nodejs.org/en/download/package-manager) (It should come with NPM, otherwise install NPM), has to be at least NodeJS 18 or up.
2. Run `git clone https://github.com/KingColton1/Snitch-and-Pearl-Reminder.git` to clone this repo into your server.
3. Run `npm install` to install required packages and dependencies.
4. Rename `.env.example` to `.env` and input necessary information in `.env` in order to run this bot.
5. Run `node index.js`

If you are using [Pterodactyl](https://pterodactyl.io/), [Pelican](https://pelican.dev/), [AMP](https://cubecoders.com/AMP), or other server management softwares that support running NodeJS, follow this:
1. Put `https://github.com/KingColton1/Snitch-and-Pearl-Reminder.git` in Git Repo Address.
2. Put `master` in Install Branch.
3. Put `index.js` in Main File.
4. Optionally you can turn on auto-update to receive automatic update for fixes or improvement. Otherwise don't turn on auto-update.

If you are using one of Discord Bot hosting services (such as BisectHosting and PebbleHost), this is the same steps as the server management software steps (just above).

# Inviting and using my bot
If you don't want to self host and instead use my bot, you may use that at the expense of using my database I host.

1. [Click here to invite Discord Bot](https://discord.com/oauth2/authorize?client_id=1298235484484538449&permissions=277025475584&integration_type=0&scope=bot).
2. Set up necessary permission and channel permission you want my bot to see and post. Alternately you can make it so your bot DM you to remind you.
3. If you plan to index everything in your snitch channel, run `/indexsnitch <channel name>`. It will automatically add everything based on snitches' coordinates (every snitch coordinates are unique), they all are assigned to you and a associated namelayer.
4. If you include both jukebox and noteblock in the same snitch channel, you need to assign some of them to a appropriate label so the bot can correctly calculate your snitch's time before deactivatation.

# Data Privacy
All data in any database (either hosted by me or you) are encrypted to protect users' privacy because it contains snitchs' coordinate, pearl time, server ID, and user ID. This security feature is included in self host version as well as my bot I host myself. You may check out how encryption work in [./libs/encrpytion.js](https://github.com/KingColton1/Snitch-and-Pearl-Reminder/blob/main/libs/encryption.js).
