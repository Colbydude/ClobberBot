module.exports = {
    name: 'addgame',
    description: 'Add a game you can subscribe to notifications for.',
    args: true,
    usage: '<game>',
    execute(logger, message, args) {
        const guild = message.guild;
        const gameName = args.join(' ');
        const roleName = `Gamers: ${gameName}`;

        if (guild.roles.cache.some(role => role.name === roleName)) {
            message.reply(`the game ${gameName} already exists. You can subscribe to receive notifications using \`!notifyme ${gameName}\`.`);

            return;
        }

        guild.roles.create({
            data: {
                name: roleName,
                color: 'GRAY',
            }
        })
        .then((role) => {
            logger.info(`Created role ${role.name}`);
            message.channel.send(`You can now subscribe to receive notifications using \`!notifyme ${gameName}\`.`);
        })
        .catch((e) => {
            logger.error(e);
            message.channel.send('Could not add the game. Does the bot have permissions to create roles?');
        });
    }
};
