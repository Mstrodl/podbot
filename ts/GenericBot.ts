import { Command as GenericBotCommand } from "./Command";
import * as Discord from "discord.js";
import { Reactor } from "./Reactor";

export class GenericBot implements GenericBot.Like {
	public readonly client: Discord.Client;
	public readonly command: GenericBot.Command;
	public readonly name: string;
	private token: string;

	constructor(name: string, token: string, { commands, onReady, trigger }: GenericBot.Options) {
		console.log("starting up...");
		[this.name, this.client, this.token] = [name, new Discord.Client(), token];
		this.command = new GenericBot.Command(this, { commands, trigger });
	}

	public clientConfigure(onReady: () => void = this.onReady): this {
		this.client.on("ready", (): void => onReady.call(this));
		this.client.on("reconnecting", (): void => this.onReconnecting.call(this));
		this.client.on("message", (message: Discord.Message): any => this.command.parser.parse.call(this.command.parser, message));
		return this;
	}

	public clientLogin(token: string = this.token): this {
		this.client.login(token);
		this.token = undefined;
		delete this.token;
		return this;
	}

	public configure(): this { return <this>this.command.hookCommands().bot.clientConfigure(); }
	public login(): this { return this.clientLogin(); }
	private onReady(): void { console.log("My circuits are ready~~~"); }
	private onReconnecting(): void { console.log("Reconnecting to server..."); }
}

export namespace GenericBot {
	export import Command = GenericBotCommand;

	export interface Constructor { new(name: string, token: string, options: GenericBot.Options): GenericBot; }

	export interface Like {
		readonly client: Discord.Client;
		readonly command: Command;
		readonly name: string;

		clientConfigure(onReady?: () => void): this;
		clientLogin(token: string): this;
		configure(): this;
		login(): this;
	}

	export interface Options extends Command.Options { onReady?: () => void }
}