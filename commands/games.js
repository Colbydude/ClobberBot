module.exports = {
    name: 'games',
    description: 'Get a list of games you can subcribe to.',
    execute(logger, message, args) {
        const guild = message.guild;

        const games = guild.roles.cache.filter(role => role.name.startsWith('Gamers: '));

        if (games.size === 0) {
            message.channel.send('There are no games to subscribe to. Add one using \`!addgame <game>\`.');

            return;
        }

        const reply = [
            "This is a list of games you can subscribe to using \`!notifyme <game>\`.",
            games.map(r => r.name.substr(8)).sort().join(', ')
        ];

        message.channel.send(reply.join('\n'));
    }
};
