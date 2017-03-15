import * as Discord from "discord.js";
import { GenericBot } from "./GenericBot";

export class RichEmbed extends Discord.RichEmbed implements RichEmbed.Like {
	public readonly channel: GenericBot.Command.TextBasedChannel;
	public message: Discord.Message;

	constructor(parsedCommand: GenericBot.Command.Parser.ParsedCommand, options: Discord.RichEmbedOptions = {}) {
		super(Object.assign({
			author: { icon_url: parsedCommand.requester.avatarURL, name: parsedCommand.requester.username },
			color: 0x673888,
			description: parsedCommand.args,
			title: parsedCommand.command
		}, options));
		this.channel = parsedCommand.channel;
	}

	public async send(): Promise<Discord.Message> { return this.message = await this.channel.sendEmbed(this, undefined, { split: true }); }

	public async update(options: Discord.RichEmbedOptions = {}): Promise<Discord.Message> {
		for (const option in options)
			if (RichEmbed.options.has(option))
				super[option] = options[option];
		return this.message = await this.message.edit(undefined, { embed: this });
	}
}

export namespace RichEmbed {
	export interface Constructor {
		prototype: Like;

		new?(parsedCommand: GenericBot.Command.Parser.ParsedCommand, options?: Discord.RichEmbedOptions): Like;
	}

	export interface Like {
		readonly channel: GenericBot.Command.TextBasedChannel;
		constructor: Constructor;

		send(): Promise<Discord.Message>;
	}

	export const options: Set<string> = new Set<string>(["title", "description", "url", "timestamp", "color", "fields", "author", "thumbnail", "image", "video", "footer"]);
}