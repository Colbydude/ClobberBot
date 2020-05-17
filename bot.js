let Discord = require('discord.js');
let logger = require('winston');
let axios = require('axios');

// Configure logger settings.
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize the bot.
let bot = new Discord.Client();

bot.on('ready', () => {
    logger.info('Logged in as ' + bot.user.tag + '!');
});

// Listen for messages.
bot.on('message', message => {
    if (message.content.substring(0, 1) == '!') {
        let args = message.content.substring(1).split(' ');
        let cmd = args[0];

        args = args.splice(1);

        switch (cmd) {
            // !tumblr
            case 'tumblr':
                let tag = args.join('+');

                axios.get('https://api.tumblr.com/v2/tagged', {
                    params: {
                        api_key: process.env.TUMBLR_API_KEY,
                        limit: 20,
                        tag: tag
                    }
                })
                .then(response => {
                    let posts = [];
                    let post = null;

                    // Get all the photo posts from the response.
                    response.data.response.forEach(post => {
                        if (post.type == 'photo') {
                            posts.push(post);
                        }
                    });

                    // Get a random post from our list of photo posts.
                    post = posts[getRandomInt(0, posts.length - 1)];

                    // If post is still null, show error.
                    if (posts == [] || post == null) {
                        message.channel.send('No photos found for tag: ' + tag);
                        logger.warn('No photos found for tag: ' + tag);

                        return;
                    }

                    // Otherwise, post the photo.
                    logger.info('Tag: ' + tag +', Photo: ' + post.photos[0].original_size.url);
                    message.channel.send(post.photos[0].original_size.url);
                })
                .catch(error => {
                    logger.error(error);
                });
            break;
        }
    }
});

// Connect the bot.
bot.login(process.env.DISCORD_TOKEN);

/**
 * Get a random integer from the given range.
 * NOTE: The maximum is exclusive and the minimum is inclusive.
 *
 * @param  int  min
 * @param  int  max
 * @return int
 */
function getRandomInt(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min)) + min;
}
