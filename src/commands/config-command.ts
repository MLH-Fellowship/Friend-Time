import { DMChannel, Guild, Message, TextChannel } from 'discord.js';
import { ServerData } from '../models/server-data';
import { UserData } from '../models/user-data';
import { ServerRepo } from '../repos';
import { MessageSender } from '../services';
import { CommandName, LangCode, LanguageService, MessageName } from '../services/language';
import { FormatOption } from '../services/language/server-config/format-option';
import { ModeOption } from '../services/language/server-config/mode-option';
import { NotifyOption } from '../services/language/server-config/notify-option';
import { ServerConfigName } from '../services/language/server-config/server-config-name';
import { UserUtils } from '../utils';
import { Command } from './command';

// TODO: This whole class needs refactored with the config options
export class ConfigCommand implements Command {
    public name = CommandName.config;

    constructor(
        private msgSender: MessageSender,
        private serverRepo: ServerRepo,
        private langService: LanguageService
    ) {}

    public async execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel,
        authorData: UserData,
        serverData?: ServerData
    ): Promise<void> {
        let author = msg.author;
        let server = msg.guild;

        if (!(channel instanceof TextChannel)) {
            await this.msgSender.send(channel, authorData.LangCode, MessageName.serverOnly);
            return;
        }

        if (args.length === 0) {
            await this.msgSender.sendWithTitle(
                channel,
                authorData.LangCode,
                MessageName.configMessage,
                MessageName.configTitle
            );
            return;
        }

        if (!UserUtils.isAdmin(author, channel as TextChannel)) {
            await this.msgSender.send(channel, authorData.LangCode, MessageName.notAdmin);
            return;
        }

        let subCommand = args[0].toLowerCase();
        let modeConfigName = this.langService.getConfigName(
            ServerConfigName.mode,
            authorData.LangCode
        );
        let formatConfigName = this.langService.getConfigName(
            ServerConfigName.format,
            authorData.LangCode
        );
        let notifyConfigName = this.langService.getConfigName(
            ServerConfigName.notify,
            authorData.LangCode
        );

        if (![modeConfigName, formatConfigName, notifyConfigName].includes(subCommand)) {
            await this.msgSender.send(channel, authorData.LangCode, MessageName.configNotFound);
            return;
        }

        if (subCommand === modeConfigName) {
            this.processConfigMode(channel, server, args.slice(1), authorData.LangCode);
            return;
        }

        if (subCommand === formatConfigName) {
            this.processConfigFormat(channel, server, args.slice(1), authorData.LangCode);
            return;
        }

        if (subCommand === notifyConfigName) {
            this.processConfigNotify(channel, server, args.slice(1), authorData.LangCode);
            return;
        }
    }

    // TODO: Extract out
    private async processConfigNotify(
        channel: TextChannel | DMChannel,
        server: Guild,
        args: string[],
        langCode: LangCode
    ): Promise<void> {
        if (args.length === 0) {
            await this.msgSender.send(channel, langCode, MessageName.configNotifyInvalidValue);
            return;
        }

        let onOption = this.langService.getConfigOptionName(
            ServerConfigName.notify,
            NotifyOption.on,
            langCode
        );
        let offOption = this.langService.getConfigOptionName(
            ServerConfigName.notify,
            NotifyOption.off,
            langCode
        );

        let notifyInput = args[0].toLowerCase();
        if (![onOption, offOption].includes(notifyInput)) {
            await this.msgSender.send(channel, langCode, MessageName.configNotifyInvalidValue);
            return;
        }

        // TODO: Better way to resolve options
        let option = true;
        if (notifyInput === offOption) {
            option = false;
        }

        await this.serverRepo.setNotify(server.id, option);

        await this.msgSender.send(channel, langCode, MessageName.configNotifySuccess, [
            {
                name: '{NOTIFY}',
                value: notifyInput,
            },
        ]);
    }

    // TODO: Extract out
    private async processConfigFormat(
        channel: TextChannel | DMChannel,
        server: Guild,
        args: string[],
        langCode: LangCode
    ): Promise<void> {
        if (args.length === 0) {
            await this.msgSender.send(channel, langCode, MessageName.configFormatInvalidValue);
            return;
        }

        let twelveOption = this.langService.getConfigOptionName(
            ServerConfigName.format,
            FormatOption.twelve,
            langCode
        );
        let twentyFourOption = this.langService.getConfigOptionName(
            ServerConfigName.format,
            FormatOption.twentyFour,
            langCode
        );

        let formatInput = args[0].toLowerCase();
        if (![twelveOption, twentyFourOption].includes(formatInput)) {
            await this.msgSender.send(channel, langCode, MessageName.configFormatInvalidValue);
            return;
        }

        // TODO: Better way to resolve options
        let option = '12';
        if (formatInput === twentyFourOption) {
            option = '24';
        }

        // TODO: Implement
        await this.serverRepo.setTimeFormat(server.id, option);

        await this.msgSender.send(channel, langCode, MessageName.configFormatSuccess, [
            {
                name: '{FORMAT}',
                value: formatInput,
            },
        ]);
    }

    // TODO: Extract out
    private async processConfigMode(
        channel: TextChannel | DMChannel,
        server: Guild,
        args: string[],
        langCode: LangCode
    ): Promise<void> {
        if (args.length === 0) {
            await this.msgSender.send(channel, langCode, MessageName.configModeInvalidValue);
            return;
        }

        let reactOption = this.langService.getConfigOptionName(
            ServerConfigName.mode,
            ModeOption.react,
            langCode
        );
        let listOption = this.langService.getConfigOptionName(
            ServerConfigName.mode,
            ModeOption.list,
            langCode
        );

        let modeInput = args[0].toLowerCase();
        if (![reactOption, listOption].includes(modeInput)) {
            await this.msgSender.send(channel, langCode, MessageName.configModeInvalidValue);
            return;
        }

        // TODO: Better way to resolve options
        let option = 'React';
        if (modeInput === listOption) {
            option = 'List';
        }

        await this.serverRepo.setMode(server.id, option);

        await this.msgSender.send(channel, langCode, MessageName.configModeSuccess, [
            {
                name: '{MODE}',
                value: modeInput,
            },
        ]);
    }
}
