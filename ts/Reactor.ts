import { Collection } from "./Collection";
import * as Discord from "discord.js";
import { GenericBot } from "./GenericBot";
import { RichEmbed } from "./RichEmbed";

// seperate this out, does RichEmbed belong in here?  maybe just as Embed? 
// more logical structure?
// finish constructor and like interfaces

export class Reactor implements Reactor.Like {
	public readonly bot: GenericBot;
	public readonly channels: Collection<string, Channel>;

	constructor(bot: GenericBot) { [this.bot, this.channels] = [bot, new Collection<string, Channel>()]; }

	public add(embed: RichEmbed): this {
		const key: string = embed.message.channel.id;

		if (!this.channels.has(key))
			this.channels.set(key, new Channel(key, this));
		this.channels.get(key).set(embed);
		Object.defineProperty(this, "bot", { enumerable: false });
		return this;
	}

	public onMessageDelete(message: Discord.Message): void {
		if (!message || !this.channels.has(message.channel.id) || !this.channels.get(message.channel.id).has(message.id))
			return;
		this.channels.get(message.channel.id).delete(message.id);
	}

	public onMessageDeleteBulk(messages: Discord.Collection<string, Discord.Message>): void {
		if (!messages)
			return;
		messages.array().forEach((message: Discord.Message): void => this.onMessageDelete(message));
	}

	private async onMessageReaction(type: "add" | "remove", reaction: Discord.MessageReaction, user?: Discord.User): Promise<Discord.Message> {
		if (!reaction || !reaction.message || !this.channels.has(reaction.message.channel.id) || !this.channels.get(reaction.message.channel.id).has(reaction.message.id) || !Message.emoticons.some((emoticon: string): boolean => emoticon === reaction.emoji.name))
			return undefined;
		const message: Message = this.channels.get(reaction.message.channel.id).get(reaction.message.id);
		const users: Discord.Collection<string, Discord.User> = await reaction.fetchUsers();

		if (!message.reactionsEnabled || type === "add" && reaction.users.array().length === 1)
			return undefined;
		let result: Discord.Message;

		switch (reaction.emoji.name) {
			case Message.emoticons.get("next"):
				result = await message.embed.next().update();
				break;
			case Message.emoticons.get("prev"):
				result = await message.embed.prev().update();
				break;
			case Message.emoticons.get("stop"):
				await message.clearReactions();
				return message.embed.message;
			case Message.emoticons.get("delete"):
				return message.embed.message.delete();
		}
		return result;
	}

	public onMessageReactionAdd(reaction: Discord.MessageReaction, user?: Discord.User): void { this.onMessageReaction("add", reaction, user).catch(console.error); }
	public onMessageReactionRemove(reaction: Discord.MessageReaction, user?: Discord.User): void { this.onMessageReaction("remove", reaction, user).catch(console.error); }
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
	public readonly reactor: Reactor;

	constructor(channelId: string, reactor: Reactor) {
		[this.channelId, this.messages, this.reactor] = [channelId, new Collection<string, Message>(), reactor];
		Object.defineProperty(this, "reactor", { enumerable: false });
	}

	public delete(messageId: string): boolean {
		this.messages.get(messageId).clearDestruct();
		return this.messages.delete(messageId);
	}

	public get(messageId: string): Message { return this.messages.get(messageId); }
	public has(messageId: string): boolean { return this.messages.has(messageId); }

	private messageDestructor: (key: string) => Promise<void> = async (key: string): Promise<void> => {
		await this.messages.get(key).clearReactions();
		await this.messages.delete(key);
	}

	public set(embed: RichEmbed): this {
		const key: string = embed.message.id;
		this.messages.set(key, new Message(embed, this)).get(key).addReactions().catch(console.error);
		this.messages.get(key).timer = this.reactor.bot.client.setTimeout((): Promise<void> => this.messageDestructor(key).catch(console.error), Channel.messageTtlMinutes * 60 * 1000);
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
	public readonly channel: Channel;
	public readonly embed: RichEmbed;
	public reactions: Collection<string, Discord.MessageReaction>;
	public reactionsEnabled: boolean;
	public timer: NodeJS.Timer;

	constructor(embed: RichEmbed, channel: Channel) {
		[this.channel, this.embed, this.reactionsEnabled] = [channel, embed, false];
		Object.defineProperty(this, "channel", { enumerable: false });
	}

	public async addReactions() {
		this.reactions = new Collection<string, Discord.MessageReaction>();

		for (const emoticon of Message.emoticons)
			this.reactions.set(emoticon.key, await this.embed.message.react(emoticon.value));
		this.reactionsEnabled = true;
	}

	public async clearReactions() {
		this.reactionsEnabled = false;
		this.embed.message.clearReactions();
	}

	public clearDestruct() { this.channel.reactor.bot.client.clearTimeout(this.timer); }
}

export namespace Message {
	export const emoticons: Collection<string, string> = new Collection<string, string>();
	emoticons.set("prev", "\u{23ee}").set("next", "\u{23ed}").set("stop", "\u{1f6d1}").set("delete", "\u{1f5d1}");

	export interface Constructor {
		prototype: Like;
	}

	export interface Like {
		constructor: Constructor;
	}
}