import { Collection } from "./Collection";
import * as Discord from "discord.js";
import { GenericBot } from "./GenericBot";

export class ReactorCollection implements ReactorCollection.Like {
	public readonly bot: GenericBot;
	public readonly tracked: Collection<string, Reactor.Id>;

	constructor(bot: GenericBot) {
		this.bot = bot;
		this.tracked = new Collection<string, Reactor.Id>();
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

export class Reactor implements Reactor.Like {
	public readonly message: Discord.Message;
	public reactions: Reactor.Emoticons<Discord.MessageReaction>;

	constructor(message: Discord.Message) { this.message = message; }

	public get id(): Reactor.Id { return { channel: this.message.channel.id, message: this.message.id }; }

	public async configureEmoticons() { this.reactions = { prev: await this.message.react(Reactor.emoticons.prev), next: await this.message.react(Reactor.emoticons.next), stop: await this.message.react(Reactor.emoticons.stop) }; }
}

export namespace Reactor {
	export interface Constructor{}

	export interface Id {
		channel: string;
		message: string;
	}

	export interface Like {}

	export interface Emoticons<T> {
		prev: T;
		next: T;
		stop: T;
	}

	export const collection: Collection<Id, Discord.Message> = new Collection<Id, Discord.Message>();
	export const emoticons: Emoticons<string> = { prev: "\u{23ee}", next: "\u{23ed}", stop: "\u{1f5d1}" };
}