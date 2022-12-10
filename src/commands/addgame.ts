import { Colors } from 'discord.js';
import { CommandContext, CommandOptionType, SlashCreator } from 'slash-create';

import ClobBotCommand from '../clobbotcommand';
import logger from '../logger';

export default class AddGameCommand extends ClobBotCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'addgame',
            description: 'Add a game you can subscribe to notifications for.',
            options: [
                {
                    name: 'game',
                    type: CommandOptionType.STRING,
                    description: 'The game you want to add',
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

            if (guild.roles.cache.some((role) => role.name === roleName)) {
                return void ctx.sendFollowUp(
                    `The game ${gameName} already exists. You can subscribe to receive notifications using \`!notifyme ${gameName}\`.`
                );
            }

            try {
                const role = await guild.roles.create({
                    name: roleName,
                    color: Colors.Grey,
                });

                logger.info(`Created role ${role.name}.`);

                return void ctx.sendFollowUp(
                    `You can now subscribe to receive notifications using \`!notifyme ${gameName}\`.`
                );
            } catch (error) {
                logger.error(error);
                return void ctx.sendFollowUp(
                    'Could not add the game. Does the bot have permissions to create roles?'
                );
            }
        } catch (error) {
            logger.error(error);
        }
    }
}
