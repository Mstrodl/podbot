export class ReactorCollection implements ReactorCollection.Like {

}

export namespace ReactorCollection {
	export interface Constructor {}

	export interface Like {}
}

export class Reactor implements Reactor.Like {
	public readonly message: Discord.Message;
	public reactions: Reactor.Emoticons<Discord.MessageReaction>;

	constructor(message: Discord.Message) { this.message = message; }

	public get id(): Reactor.Id { return { channel: message.channel.id, message: message.id }; }

	public async configureEmoticons() { this.reactions = { prev: await this.message.react(Reactor.Emoticons.prev), next: await this.message.react(Reactor.Emoticons.next), stop: await this.message.react(React.Emoticons.stop) }; }
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