# src-wrs-bot-v2
A bot for tracking speedrun.com world records in your discord server.

## SETUP

### Self-hosting

1. Install these pre-requisites:
   - [Docker](https://www.docker.com/products/docker-desktop/)
   - [Node](https://nodejs.org/en/download/)
1. Create a `.env` file in the root directory - reference the `.env.example` file.
1. `docker-compose up` to start up the database.

You can view the database via phpmyadmin on that machine by going to `localhost:8081`.

### Hosting on AWS

### Development Environment

Requires all pre-requesites in Self-hosting.

To develop the bot, you run `docker-compose.dev.yml` to host the MySQL database, and run the bot on your local machine via `npm run dev` or `npm run start`. This allows for easy modification of the code.
