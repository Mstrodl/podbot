import { Collection } from "./Collection";
import * as Discord from "discord.js";
import { GenericBot } from "./GenericBot";
import { RichEmbed } from "./RichEmbed";

export class Reactor extends Collection<string, Channel> implements Reactor.Like {
	public delete(message: Discord.Message): void {
		if (!message || !super.has(message.channel.id) || !super.get(message.channel.id).has(message.id))
			return;
	}

	public react(reaction: Discord.MessageReaction): void {
		if (!reaction || reaction.me || !reaction.message || !super.has(reaction.message.channel.id) || !super.get(reaction.message.channel.id).has(reaction.message.id))
			return;
	}

	public set(value: any, key?: any): this {
		key = (<Message.EmbedIterator>value).embed.message.channel.id;

		if (!super.has(<string>key))
			super.set(<string>key, new Channel(<string>key));
		super.get(<string>key).set(<Message.EmbedIterator>value);
		return this;
	}
}

export namespace Reactor {
	export interface Constructor {
		prototype: Like;
	}

	export interface Like {
		constructor: Constructor;
	}
}

export class Channel extends Collection<string, Message> implements Channel.Like {
	public readonly channelId: string;

	constructor(channelId: string) {
		super();
		Object.defineProperty(this, "channelId", { enumerable: true, value: channelId });
	}

	private messageDestructor: (key: string) => void = (key: string): void => { super.delete(key); }

	public set(value: any, key?: any): this {
		key = (<Message.EmbedIterator>value).embed.message.id;
		super.set(<string>key, new Message(<Message.EmbedIterator>value)).get(<string>key).addReactions();
		super.get(<string>key).timer = setTimeout(this.messageDestructor, Channel.messageTtlMinutes * 60 * 1000, <string>key);
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
	public readonly iterator: Message.EmbedIterator;
	public reactions: Collection<string, Discord.MessageReaction>;
	public timer: number;

	constructor(iterator: Message.EmbedIterator) {
		this.iterator = iterator;
	}

	public async addReactions() { this.reactions = await Message.emoticons.map<Discord.MessageReaction>(async (emoticon: string): Discord.MessageReaction => await this.iterator.embed.message.react(emoticon)); }
}

export namespace Message {
	export const emoticons: Collection<string, string> = new Collection<string, string>();
	emoticons.set("prev", "\u{23ee}").set("next", "\u{23ed}").set("stop", "\u{1f5d1}");

	export interface Constructor {
		prototype: Like;
	}

	export interface EmbedIterator extends Iterator<RichEmbed> { embed: RichEmbed; }

	export interface Like {
		constructor: Constructor;
	}
}

/*
when a reactable message is sent
	add reactions to it
	place it in a collection associated with the command name and the iterable 
		add a timer that will self-destruct the message after 5 minutes

on messageReactionAdd or messageReactionDelete
	check collection to see if the message id exists
	if it does, then rotate to the next item in the iterable and update

on messageDelete
	check collection to see if the message id exists
	if it does, then remove it from the internal collection

*/

/*
class ReactorCollectionGeneric<Value extends ImportedCollection<string, Iterator<RichEmbed>> | Iterator<RichEmbed>> extends ImportedCollection<string, Value> {
	protected setProperty(property: string, value: any): this { return Object.defineProperty(this, property, value); }
}

export class ReactorCollection extends ReactorCollectionGeneric<Reactor> implements ReactorCollection.Like {
	// public readonly bot: GenericBot;

	constructor(bot: GenericBot) {
		super();
		// super.setProperty("bot", bot);
	}

	public react(reaction: Discord.MessageReaction): void {
		if (reaction.me)
			return;

	}
}

export namespace ReactorCollection {
	export interface Constructor {}

	export interface Like {}
}

export class Reactor extends ReactorCollectionGeneric<Iterator<RichEmbed>> implements Reactor.Like {
	public reactions: Reactor.Emoticons<Discord.MessageReaction>;

	constructor() {
		super();
	}

	// public get id(): Reactor.Id { return { channel: this.message.channel.id, message: this.message.id }; }

	public async configureEmoticons() {
		super.setProperty("reactions", { prev: await this.message.react(Reactor.emoticons.prev), next: await this.message.react(Reactor.emoticons.next), stop: await this.message.react(Reactor.emoticons.stop) });
	}
}

export namespace Reactor {
	export const emoticons: Emoticons<string> = { prev: "\u{23ee}", next: "\u{23ed}", stop: "\u{1f5d1}" };

	export interface Constructor{
		prototype: Like;
	}

	export interface Id {
		channel: string;
		message: string;
	}

	export interface Like {
		constructor: Constructor;
	}

	export interface Emoticons<T> {
		prev: T;
		next: T;
		stop: T;
	}
}

*/