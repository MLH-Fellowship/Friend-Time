import { Guild, GuildMember } from 'discord.js';

export abstract class GuildUtils {
    public static getMemberDiscordIds(guild: Guild): string[] {
        if ((process.env.RESPOND_TO_BOT_MESSAGES || process.env.RESPOND_TO_BOT_REACTIONS)  === 'true') {
            return guild.members.cache.keyArray();
        } else {
            return guild.members.cache.filter(member => !member.user.bot).keyArray();
        }
    }

    public static async findMember(guild: Guild, query: string): Promise<GuildMember> {
        query = query.toLowerCase();

        let members = await guild.members.fetch();
        return (
            members.find(member => member.nickname?.toLowerCase().includes(query)) ??
            members.find(member => member.user.tag.toLowerCase().includes(query)) ??
            members.find(member => member.user.id.includes(query)) ??
            undefined
        );
    }
}
