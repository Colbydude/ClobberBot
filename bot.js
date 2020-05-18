const fs = require('fs');
const Discord = require('discord.js');
const logger = require('winston');

const prefix = '!';

// Configure logger settings.
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { colorize: true });
logger.level = 'debug';

// Initialize the bot.
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

// Load in command handlers.
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}

// Initialization.
bot.once('ready', () => {
    logger.info('Logged in as ' + bot.user.tag + '!');
    logger.info(`Loaded ${bot.commands.size} command handlers.`);
});

// Listen for messages.
bot.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot || message.channel.type !== 'text') {
        return;
    }

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = bot.commands.get(commandName);

    if (!command) {
        return;
    }

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\`.`;
        }

        return message.channel.send(reply);
    }

    try {
        command.execute(logger, message, args);
    } catch (error) {
        logger.error(error);
        message.channel.send(`There was an error trying to execute the ${commandName} command!`);
    }
});

// Connect the bot.
bot.login(process.env.DISCORD_TOKEN);
