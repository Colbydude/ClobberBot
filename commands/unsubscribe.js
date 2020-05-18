module.exports = {
    name: 'unsubscribe',
    description: 'Unsubscribe from a game.',
    args: true,
    usage: '<game>',
    execute(logger, message, args) {
        const guild = message.guild;
        const member = message.member;
        const gameName = args.join(' ');
        const roleName = `Gamers: ${gameName}`;

        const role = guild.roles.cache.find(role => role.name === roleName);

        if (!role) {
            message.reply(`the game ${gameName} does not exist. You can add it using \`!addgame <game>\`, or check existing games using \`!games\`.`);

            return;
        }

        member.roles.remove(role);
        message.react('👍');
    }
};
