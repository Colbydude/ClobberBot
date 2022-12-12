import { CommandContext, CommandOptionType, SlashCreator } from 'slash-create';

import ClobBotCommand from '../clobbotcommand';

export default class NotifyMeCommand extends ClobBotCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'notifyme',
            description: 'Subscribe to a game.',
            options: [
                {
                    name: 'game',
                    type: CommandOptionType.STRING,
                    description: 'The game you want to subscribe to',
                    required: true,
                },
            ],
        });

        this.filePath = __filename;
    }

    async run(ctx: CommandContext): Promise<void> {
        try {
            await ctx.defer();

            const guild = await this.getGuild(ctx);
            const member = await this.getMember(guild, ctx.user.id);

            const gameName = ctx.options.game;
            const roleName = `Gamers: ${gameName}`;

            const role = guild.roles.cache.find((role) => role.name === roleName);

            if (!role) {
                return void ctx.sendFollowUp(
                    `❗️ | The game \`${gameName}\` does not exist. You can add it using \`/addgame <game>\`, or check existing games using \`/games\`.`
                );
            }

            member.roles.add(role);

            return void ctx.sendFollowUp('👍 | Subscribed!');
        } catch (error) {
            return void this.handleError(ctx, error);
        }
    }
}
