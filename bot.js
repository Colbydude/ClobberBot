const Discord = require('discord.js');
const logger = require('winston');

const prefix = '!';

// Configure logger settings.
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { colorize: true });
logger.level = 'debug';

// Initialize the bot.
const bot = new Discord.Client();

bot.on('ready', () => {
    logger.info('Logged in as ' + bot.user.tag + '!');
});

// Message Handlers
// const addGameHandler = (message, content) => {
//     // @TODO
// };

// const initHandler = (message, content) => {
//     // @TODO
// };

// const notifyMeHandler = (message, content) => {
//     // @TODO
// };

// Listen for messages.
bot.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) {
        return;
    }

    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();
    const content = args.join(' ');

    logger.debug(`cmd: ${cmd}`);
    logger.debug(`args: ${args}`);
    logger.debug(`content: ${content}`);

    // switch (cmd) {
    // case ('addgame'):
    //     addGameHandler(message, content);
    //     break;
    // case ('init'):
    //     initHandler(message, content);
    //     break;
    // case ('notifyme'):
    //     notifyMeHandler(message, content);
    //     break;
    // }
});

// Connect the bot.
bot.login(process.env.DISCORD_TOKEN);
