module.exports = {
    name: 'removegame',
    description: 'Remove a game you can subscribe to notifications for.',
    args: true,
    usage: '<game>',
    execute(logger, message, args) {
        const guild = message.guild;
        const gameName = args.join(' ');
        const roleName = `Gamers: ${gameName}`;

        const role = guild.roles.cache.find(role => role.name === roleName);

        if (!role) {
            message.reply(`the game ${gameName} does not exist. You can add it using \`!addgame ${gameName}\`.`);

            return;
        }

        role.delete();
        message.react('👍');
    }
};
