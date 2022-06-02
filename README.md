# src-wrs-bot-v2
A bot for tracking speedrun.com world records in your discord server.


## SETUP
1. Clone the repo to your machine & install Node if you have not already.
2. Run `npm install` to install the necessary NPM packages.
3. Add a `.env` file in the root of the project and fill it with necessary values (example below):
   - `TOKEN`: The secret token of the discord bot to run in.
   - `admin`: The id of your discord account - the admin of the bot. This user will have full access to the bot's commands, so be careful.
   - `MYSQL_ROOT_PASSWORD`: Password to your mysql server.
   - `MYSQL_DATABASE`: Name of the MySQL database. You should probably set this to something like `src-wrs`
   - `PORT`: The port to the MYSQL server.

Example `.env`:
```env
TOKEN="wyushdf sdfhvhzivuoizhvsoidhvsfiuasfhd asfoihasfkljshaf"
admin=270856336466509835
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=src-wrs
```
1. Install Docker Desktop.
2. Currently, we run development by `docker-compose -f docker-compose.dev.yml up` to run the MySQL server and phpmyadmin, then running `npm run dev` to run the app in dev mode. This will change in the future.