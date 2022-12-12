import { CommandContext, SlashCreator } from 'slash-create';

import ClobBotCommand from '../clobbotcommand';

export default class GamesCommand extends ClobBotCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'games',
            description: 'Get a list of games you can subcribe to.',
        });

        this.filePath = __filename;
    }

    async run(ctx: CommandContext): Promise<void> {
        try {
            await ctx.defer();

            const guild = await this.getGuild(ctx);
            const games = guild.roles.cache.filter((role) => role.name.startsWith('Gamers: '));

            if (games.size === 0) {
                return void ctx.sendFollowUp(
                    '😢 | There are no games to subscribe to. Add one using `/addgame <game>`.'
                );
            }

            const reply = [
                '🎮 | This is a list of games you can subscribe to using `/notifyme <game>`.',
                games
                    .map((r) => r.name.substring(8))
                    .sort()
                    .join(', '),
            ];

            return void ctx.sendFollowUp(reply.join('\n'));
        } catch (error) {
            return void this.handleError(ctx, error);
        }
    }
}
