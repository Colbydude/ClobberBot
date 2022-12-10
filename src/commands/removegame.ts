import { CommandContext, CommandOptionType, SlashCreator } from 'slash-create';

import ClobBotCommand from 'clobbotcommand';
import logger from '../logger';

export default class RemoveGameCommand extends ClobBotCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'removegame',
            description: 'Remove a game you can subscribe to notifications for.',
            options: [
                {
                    name: 'game',
                    type: CommandOptionType.STRING,
                    description: 'The game you want to remove',
                    required: true,
                },
            ],
        });

        this.filePath = __filename;
    }

    async fun(ctx: CommandContext): Promise<void> {
        try {
            await ctx.defer();

            const guild = await this.getGuild(ctx);

            const gameName = ctx.options.game.join(' ');
            const roleName = `Gamers: ${gameName}`;
            const role = guild.roles.cache.find((role) => role.name === roleName);

            if (!role) {
                return void ctx.sendFollowUp(
                    `The game ${gameName} does not exist. You can add it using \`!addgame ${gameName}\`.`
                );
            }

            role.delete();

            return void ctx.sendFollowUp('👍');
        } catch (error) {
            logger.error(error);
        }
    }
}
