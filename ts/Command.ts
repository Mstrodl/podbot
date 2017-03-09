import { Defaults as CommandDefaults } from "./Command.Defaults";
import { Parser as CommandParser } from "./Command.Parser";
import * as Discord from "discord.js";
import { GenericBot } from "./GenericBot";


export class Command implements Command.Like {
	public readonly bot: GenericBot;
	private readonly commands: Command.CommandsObject;
	public readonly parser: Command.Parser;
	public readonly trigger: string;

	constructor(bot: GenericBot, { commands, trigger = "!" }: Command.Options) {
		this.bot = bot;
		this.commands = commands;
		this.trigger = trigger;
		this.parser = new Command.Parser(this, { enabledCommands: new Set<string>((commands == undefined) ? Command.defaults : Object.keys(commands)) });
	}

	public hookCommands(commands: Command.CommandsObject = this.commands): this {
		if (commands != undefined)
			for (const command in commands)
				if (commands[command].default)
					this.parser.on(command, (parsedCommand: Command.Parser.ParsedCommand): any => Promise.resolve(Command.Defaults[command].call(undefined, parsedCommand)).catch(console.error));
				else if (commands[command].command)
					this.parser.on(command, (parsedCommand: Command.Parser.ParsedCommand): any => Promise.resolve(commands[command].command.call(undefined, parsedCommand)).catch(console.error));
				else if (commands[command].alias)
					this.parser.on(command, (parsedCommand: Command.Parser.ParsedCommand): any => Promise.resolve(commands[commands[command].alias].command.call(undefined, parsedCommand)).catch(console.error));
				else
					this.parser.on(command, (parsedCommand: Command.Parser.ParsedCommand): any => Promise.resolve(Command.Defaults[command].call(undefined, parsedCommand)).catch(console.error));
		return this;
	}
}

export namespace Command {
	export import Defaults = CommandDefaults;
	export import Parser = CommandParser;
	export const defaults: Set<string> = new Set<string>(Array.of("4chan", "db", "google", "ping", "say", "topic", "uptime"));

	export type TextBasedChannel = Discord.DMChannel | Discord.GroupDMChannel | Discord.TextChannel;

	export interface CommandsObject { [key: string]: HookOptions/*(parsedCommand: Parser.ParsedCommand) => any;*/ }

	export interface HookOptions {
		alias?: string;
		command?: (parsedCommand: Parser.ParsedCommand) => any;
		default?: boolean;
	}

	export interface Constructor { new(bot: GenericBot, options: Options): Command; }

	export interface Like {
		bot: GenericBot;
		parser: Parser;
		trigger: string;

		hookCommands(commands?: CommandsObject): this;
	}

	export interface Options {
		commands?: CommandsObject;
		trigger: string;
	}
}