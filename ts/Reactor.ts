import * as Discord from "discord.js";

export class ReactorCollection extends Map<Reactor.Id, Discord.Message> implements ReactorCollection.Like {
	public readonly tracked: Map<string, Reactor.Id>;
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

	export const collection: Map<Id, Discord.Message>
	export const emoticons: Emoticons<string> = { prev: "\u{23ee}", next: "\u{23ed}", stop: "\u{1f5d1}" };
}