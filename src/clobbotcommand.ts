import { Client, Guild, GuildMember, TextChannel } from 'discord.js';
import { CommandContext, SlashCommand } from 'slash-create';

import logger from './logger';

/**
 * Nice wrapper around SlashCommand<Client> for common functionality.
 */
export default class ClobBotCommand extends SlashCommand<Client> {
    /**
     * Get the given channel from the guild.
     */
    protected async getChannel(guild: Guild, channelId: string): Promise<TextChannel> {
        const channel = (await guild.channels.fetch(channelId)) as TextChannel;

        if (channel === null) {
            throw new Error(`Could not fetch channel for ${channelId}.`);
        }

        return channel;
    }

    /**
     * Get the guild out of the given context.
     */
    protected async getGuild(ctx: CommandContext): Promise<Guild> {
        if (!ctx.guildID) {
            throw new Error('Guild ID not set.');
        }

        return await this.client.guilds.fetch(ctx.guildID);
    }

    /**
     * Get the given member from the guild.
     */
    protected async getMember(guild: Guild, userId: string): Promise<GuildMember> {
        return await guild.members.fetch(userId);
    }

    /**
     * Common error handling for all commands.
     */
    handleError(ctx: CommandContext, error: Error) {
        logger.error('💥', error);
        return void ctx.sendFollowUp('💥 | An error occurred. Check the logs for more details.');
    }
}
