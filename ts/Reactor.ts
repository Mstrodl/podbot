import { Collection } from "./Collection";
import * as Discord from "discord.js";
import { GenericBot } from "./GenericBot";
import { RichEmbed } from "./RichEmbed";

export class Reactor implements Reactor.Like {
	public readonly channels: Collection<string, Channel>;

	constructor() { this.channels = new Collection<string, Channel>(); }

	public onMessageDelete(message: Discord.Message): void {
		if (!message || !this.channels.has(message.channel.id) || !this.channels.get(message.channel.id).has(message.id))
			return;
		this.channels.get(message.channel.id).delete(message.id);
	}

	public onMessageDeleteBulk(messages: Discord.Collection<string, Discord.Message>): void {}

	public onMessageReaction(reaction: Discord.MessageReaction, user?: Discord.User): void {
		if (!reaction || reaction.me || !reaction.message || !this.channels.has(reaction.message.channel.id) || !this.channels.get(reaction.message.channel.id).has(reaction.message.id))
			return;
		this.channels.get(reaction.message.channel.id).get(reaction.message.id).embed.next().update().catch(console.error);
	}

	public add(embed: RichEmbed): this {
		const key: string = embed.message.channel.id;

		if (!this.channels.has(key))
			this.channels.set(key, new Channel(key));
		this.channels.get(key).set(embed);
		return this;
	}
}

export namespace Reactor {
	export interface Command {
		bot: GenericBot;
		channel: GenericBot.Command.TextBasedChannel;
		embeds: Array<Discord.RichEmbedOptions>;
	}

	export interface Constructor {
		prototype: Like;
	}

	export interface Like {
		constructor: Constructor;
	}
}

export class Channel implements Channel.Like {
	public readonly channelId: string;
	public readonly messages: Collection<string, Message>;

	constructor(channelId: string) {
		[this.channelId, this.messages] = [channelId, new Collection<string, Message>()];
	}

	public delete(channelId: string): boolean { return this.messages.delete(channelId); }
	public get(channelId: string): Message { return this.messages.get(channelId); }
	public has(channelId: string): boolean { return this.messages.has(channelId); }
	private messageDestructor: (key: string) => void = (key: string): void => { this.messages.delete(key); }

	public set(embed: RichEmbed): this {
		const key: string = embed.message.id;
		this.messages.set(key, new Message(embed)).get(key).addReactions().catch(console.error);
		this.messages.get(key).timer = setTimeout(this.messageDestructor, Channel.messageTtlMinutes * 60 * 1000, key);
		return this;
	}
}

export namespace Channel {
	export const messageTtlMinutes: number = 5;

	export interface Constructor {
		prototype: Like;
	}

	export interface Like {
		constructor: Constructor;
	}
}

export class Message implements Message.Like {
	public readonly embed: RichEmbed;
	public reactions: Collection<string, Discord.MessageReaction>;
	public timer: NodeJS.Timer;

	constructor(embed: RichEmbed) {
		this.embed = embed;
	}

	public async addReactions() {
		this.reactions = new Collection<string, Discord.MessageReaction>();

		for (const emoticon of Message.emoticons)
			this.reactions.set(emoticon.key, await this.embed.message.react(emoticon.value));
	}
}

export namespace Message {
	export const emoticons: Collection<string, string> = new Collection<string, string>();
	emoticons.set("prev", "\u{23ee}").set("next", "\u{23ed}").set("stop", "\u{1f5d1}");

	export interface Constructor {
		prototype: Like;
	}

	export interface Like {
		constructor: Constructor;
	}
}