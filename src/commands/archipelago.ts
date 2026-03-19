import {
    ButtonStyle,
    CommandContext,
    CommandOptionType,
    ComponentType,
    SlashCreator,
    TextInputStyle,
} from 'slash-create';

import { connect } from '../arch';
import ClobBotCommand from '../clobbotcommand';
import { createSession } from '../db/repositories/archipelagoSession';
import logger from '../logger';

export default class ArchipelagoStart extends ClobBotCommand {
    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'archipelago',
            description: 'test',
            options: [
                {
                    type: CommandOptionType.SUB_COMMAND,
                    name: 'start',
                    description: 'Start an Archipelago session.',
                    options: [
                        {
                            name: 'server',
                            type: CommandOptionType.STRING,
                            description: 'The Archipelago server to connect to.',
                            required: true,
                        },
                        {
                            name: 'slot',
                            type: CommandOptionType.STRING,
                            description:
                                'The slot to join as. This prevents the user who starts the session from needing to also join.',
                            required: true,
                        },
                    ],
                },
            ],
        });

        this.filePath = __filename;
    }

    async run(ctx: CommandContext): Promise<void> {
        try {
            await ctx.defer();

            const channel = ctx.channelID;
            const guild = await this.getGuild(ctx);
            const member = await this.getMember(guild, ctx.user.id);

            switch (ctx.subcommands[0]) {
                case 'start':
                    const server = ctx.options[ctx.subcommands[0]].server;
                    const slot = ctx.options[ctx.subcommands[0]].slot;

                    try {
                        // Connect to the Archipelago Server
                        var client = await connect(guild.id, channel, server, slot);
                    } catch (error) {
                        logger.error(error);
                        return void ctx.sendFollowUp(
                            '💥 | Could not connect to the Archipelago server. Check the logs for more details.',
                        );
                    }

                    try {
                        // Create the session.
                        var newSession = await createSession(guild.id, client.room.seedName, {
                            discord_user: member.user.username,
                            game: client.game,
                            slot,
                            status: 'joined',
                        });

                        // @TODO: Player
                    } catch (error) {
                        logger.error(error);
                        return void ctx.sendFollowUp(
                            '💥 | Could not instantiate session in the database. Check the logs for more details.',
                        );
                    }

                    ctx.send({
                        embeds: [
                            {
                                title: 'Archipelago Session Created',
                                description: `Seed: \`${newSession.seed}\`\nJoin to get _Archipelapoints_:tm:.`,
                                color: 0x5865f2,
                            },
                        ],
                        components: [
                            {
                                type: ComponentType.ACTION_ROW,
                                components: [
                                    {
                                        type: ComponentType.BUTTON,
                                        style: ButtonStyle.PRIMARY,
                                        label: 'Join',
                                        custom_id: 'open_slot_modal',
                                    },
                                ],
                            },
                        ],
                    });

                    return void ctx.registerComponent('open_slot_modal', (buttonCtx) => {
                        return void buttonCtx.sendModal(
                            {
                                title: 'Join Archipelago',
                                custom_id: 'slot_modal',
                                components: [
                                    {
                                        type: ComponentType.ACTION_ROW,
                                        components: [
                                            {
                                                type: ComponentType.TEXT_INPUT,
                                                custom_id: 'slot_name',
                                                label: 'Your Archipelago Slot Name',
                                                style: TextInputStyle.SHORT,
                                                required: true,
                                            },
                                        ],
                                    },
                                ],
                            },
                            (modalCtx) => {
                                modalCtx.send({ content: 'Joined', ephemeral: true });
                            },
                        );
                    });
            }

            return void ctx.sendFollowUp('Please choose a subcommand.');
        } catch (error) {
            return void this.handleError(ctx, error);
        }
    }
}
