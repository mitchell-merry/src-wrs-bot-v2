# src-wrs-bot-v2

A bot for tracking speedrun.com world records in your discord server.

The following subject has not been tested and is subject to serious misinformation, but I tried my best.

## SETUP

All of these require:

-   A discord bot account to log into, including the Token and Client ID (ID of the account).
-   An administrator (most likely yourself)'s discord account ID.
-   A guild to designate as the "admin guild", where you can do special adminning.

After getting the bot running, you should probably run the `/admin update_commands` command in the admin guild to register the commands globally.

### Self-hosting

1. Install [Docker / Docker Desktop](https://www.docker.com/products/docker-desktop/).
1. Create a `.env` file in the root directory - reference the `.env.example` file.
1. `docker-compose up` to start it up.

You can view the database via phpmyadmin on that machine by going to `localhost:8081`.

### Hosting on AWS

1. Install the [AWS CLI](https://aws.amazon.com/cli/).
1. Log into your AWS account with `aws configure`.
1. Run the following command:

```
aws cloudformation deploy
	--template-file cloudformation.yml
	--stack-name <StackNameHere>
	--parameter-overrides
		IP=<public IP of your network>
		DiscordToken=<token>
		DiscordClient=<ID>
		DiscordAdmin=<ID>
		DiscordAdminGuild=<ID>
		DBPass=<password>
		DBSnapshot=<optionally, a snapshot to create the DB from>
```

which will deploy a CloudFormation stack to the aws stack containing the bot and the RDS instance.

Note the IP parameter is currently required, but will become optional soon. This allows your machine to log into the RDS instance via `mysql` for debugging.

### Development Environment

1. Install [Node](https://nodejs.org/en/download/).
1. Install [Docker / Docker Desktop](https://www.docker.com/products/docker-desktop/).
1. `npm install -D` to install dependencies.
1. Create a `.env` file in the root directory - reference the `.env.example` file.
1. `docker-compose -f docker-compose.dev.yml up` to run the bot / phpmyadmin.
1. `npm run dev` to run the bot on the local machine. Be sure to specify "DBHost" as localhost.
