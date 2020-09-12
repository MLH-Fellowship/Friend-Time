import { DMChannel, Message, TextChannel } from 'discord.js-light';
import { ServerData } from '../models/server-data';
import { UserData } from '../models/user-data';
import { CommandName } from '../services/language/command-name';

export interface Command {
    name: CommandName;
    execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel,
        authorData: UserData,
        serverData?: ServerData
    ): Promise<void>;
}
