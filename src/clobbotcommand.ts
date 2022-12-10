import { Client, Guild, GuildMember, TextChannel } from 'discord.js';
import { CommandContext, SlashCommand } from 'slash-create';

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
}
