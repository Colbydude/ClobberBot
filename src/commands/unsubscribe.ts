import { CommandContext, CommandOptionType, SlashCreator } from 'slash-create';

import ClobBotCommand from 'clobbotcommand';
import logger from '../logger';

export default class UnsubscribeCommand extends ClobBotCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'unsubscribe',
            description: 'Unsubscribe from notifications for a game.',
            options: [
                {
                    name: 'game',
                    type: CommandOptionType.STRING,
                    description: 'The game you want to unsubscribe from',
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
            const member = await this.getMember(guild, ctx.user.id);

            const gameName = ctx.options.game.join(' ');
            const roleName = `Gamers: ${gameName}`;
            const role = guild.roles.cache.find((role) => role.name === roleName);

            if (!role) {
                return void ctx.sendFollowUp(
                    `The game ${gameName} does not exist. You can add it using \`!addgame <game>\`, or check existing games using \`!games\`.`
                );
            }

            member.roles.remove(role);

            return void ctx.sendFollowUp('👍');
        } catch (error) {
            logger.error(error);
        }
    }
}
