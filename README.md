# src-wrs-bot-v2
A bot for tracking speedrun.com world records in your discord server.


## SETUP
1. Clone the repo to your machine & install Node and Docker (Desktop) if you have not already.
2. Run `npm install` to install the necessary NPM packages.
3. Add a `.env` file in the root of the project and fill it with necessary values (example below):
   - `TOKEN`: The secret token of the discord bot to run in.
   - `admin`: The id of your discord account - the admin of the bot. This user will have full access to the bot's commands, so be careful.
   - `client`: The client ID of the discord bot account.
   - `guild`: Optional - used for register commands to a specific guild. Omit when running `npm run registerCommands` to globally set commands.
   - `MYSQL_ROOT_PASSWORD`: Password to your mysql server.
   - `MYSQL_DATABASE`: Name of the MySQL database. You should probably set this to something like `src-wrs`
   - `PORT`: The port to the MYSQL server.

Example `.env`:
```env
TOKEN=OTgxMTg0MzQ5NDkzOTE5ODc0.GYd3M5.gBATV20FDVFrBxQ9Cz-cfzjwacIrGEyQSTEE78
admin=270856336466509835
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=src-wrs
PORT=6603
```
4. Enable the GUILD_MEMBERS privileged intent in your bot's developer portal on Discord.
5. Run the MySQL and phpmyadmin containers by running `npm run db:up`, and then use the corresponding commands `db:stop` and `db:down` to stop/remove the containers.
6. Then, run the bot with `npm run dev`.