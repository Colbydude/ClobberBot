import { type Client } from 'archipelago.js';
import { Table } from 'embed-table';
import {
    ButtonStyle,
    CommandContext,
    CommandOptionType,
    ComponentType,
    SlashCreator,
    TextInputStyle,
} from 'slash-create';

import { connect, findPlayerBySlotName } from '../archipelagoClient';
import ClobBotCommand from '../clobbotcommand';
import { type ArchipelagoPlayer } from '../db/models/archipelagoPlayer';
import { type ArchipelagoPlayerGame } from '../db/models/archipelagoPlayerGame';
import { type ArchipelagoSession } from '../db/models/archipelagoSession';
import { findOrCreatePlayer, getPlayerLeaderboard } from '../db/repositories/archipelagoPlayer';
import { findOrCreateGameForPlayer } from '../db/repositories/archipelagoPlayerGame';
import { createSession } from '../db/repositories/archipelagoSession';
import { addSessionPlayer } from '../db/repositories/archipelagoSessionPlayer';
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
                {
                    type: CommandOptionType.SUB_COMMAND,
                    name: 'leaderboard',
                    description: 'Display the Archipelago Leaderboard',
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

                    let client: Client;

                    // Connect to the Archipelago Server.
                    try {
                        client = await connect(guild.id, channel, server, slot);
                    } catch (error) {
                        logger.error(error);
                        await ctx.sendFollowUp({ content: `💥 | ${error}`, ephemeral: true });
                        return;
                    }

                    let player: ArchipelagoPlayer;
                    let session: ArchipelagoSession;
                    let game: ArchipelagoPlayerGame;

                    // No solo games allowed. :)
                    if (Object.values(client.players.slots).length == 1) {
                        await ctx.sendFollowUp({
                            content: `🔪 | No solo Archipelagos allowed. :)`,
                            ephemeral: true,
                        });
                        return;
                    }

                    // Create the session.
                    try {
                        player = await findOrCreatePlayer({
                            discord_id: member.user.id,
                            discord_username: member.user.username,
                        });

                        session = await createSession({
                            discord_guild_id: guild.id,
                            seed: client.room.seedName,
                            started_by: player,
                        });

                        game = await findOrCreateGameForPlayer({
                            player,
                            name: client.players.self.game,
                        });

                        await addSessionPlayer({
                            session,
                            player,
                            game,
                            slot,
                        });
                    } catch (error) {
                        logger.error(error);
                        await ctx.sendFollowUp({ content: `💥 | ${error}`, ephemeral: true });
                        return;
                    }

                    // Display embed with join button.
                    await ctx.send({
                        embeds: [
                            {
                                title: 'Archipelago Session Created',
                                description: `Seed: \`${session.seed}\`\nJoin to get _Archipelapoints_:tm:.`,
                                thumbnail: {
                                    url: 'https://avatars.githubusercontent.com/u/76268402?s=200&v=4',
                                },
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

                    // Slot modal.
                    ctx.registerComponent('open_slot_modal', async (buttonCtx) => {
                        buttonCtx.sendModal(
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
                            async (modalCtx) => {
                                try {
                                    const member = await this.getMember(guild, modalCtx.user.id);
                                    const slot = modalCtx.values['slot_name'];

                                    logger.info(
                                        `${member.user.username} joining under slot ${slot}...`,
                                    );

                                    const joinPlayer = await findOrCreatePlayer({
                                        discord_id: member.user.id,
                                        discord_username: member.user.username,
                                    });

                                    const slotData = findPlayerBySlotName(client, slot as string);

                                    const game = await findOrCreateGameForPlayer({
                                        player: joinPlayer,
                                        name: slotData.game,
                                    });

                                    await addSessionPlayer({
                                        session,
                                        player: joinPlayer,
                                        game,
                                        slot: slot as string,
                                    });

                                    await modalCtx.send({
                                        content: `🎮 | ${member.user.username} joined under slot ${slot}, playing ${slotData.game}!`,
                                    });
                                } catch (error) {
                                    logger.error(error);
                                    await modalCtx.send({
                                        content: `💥 | ${error}`,
                                        ephemeral: true,
                                    });
                                }
                            },
                        );
                    });

                    // Send join message for host.
                    await ctx.send({
                        content: `🎮 | ${member.user.username} joined under slot ${slot}, playing ${client.players.self.game}!`,
                    });

                    break;
                case 'leaderboard':
                    const leaderboard = await getPlayerLeaderboard();
                    const emojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

                    const table = new Table({
                        titles: ['🏅', 'User', 'Points', '(C/R)'],
                        titleIndexes: [0, 4, 36, 66],
                        columnIndexes: [0, 4, 20, 36],
                        start: '`',
                        end: '`',
                    });

                    leaderboard.forEach((entry) => {
                        table.addRow([
                            `${emojis.shift()}`,
                            `${entry.discord_username}`,
                            `${entry.score} Points`,
                            `(${entry.total_completions}/${entry.total_releases})`,
                        ]);
                    });

                    await ctx.send({
                        embeds: [
                            {
                                title: 'Archipelago Leaderboard',
                                fields: [table.toField()],
                                thumbnail: {
                                    url: 'https://avatars.githubusercontent.com/u/76268402?s=200&v=4',
                                },
                                color: 0x5865f2,
                            },
                        ],
                    });

                    break;
            }
        } catch (error) {
            await this.handleError(ctx, error);
            return;
        }
    }

    async displayLeaderboard(): Promise<void> {}
}
