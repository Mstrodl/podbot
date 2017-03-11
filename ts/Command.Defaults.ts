import { DateFormatted } from "./DateFormatted";
import * as Derpibooru from "./Derpibooru";
import * as Discord from "discord.js";
import * as FourChan from "./FourChan";
import { GenericBot } from "./GenericBot";
import * as Google from "./Google";
import { Query } from "./Url";

export class Defaults {
	public static async ["4chan"](parsedCommand: GenericBot.Command.Parser.ParsedCommand): Promise<Discord.Message> { return Defaults.fourChan(parsedCommand); }
}

export namespace Defaults {
	export interface SayEmbedOptions {
		author?: Discord.User;
		color?: number;
		description?: string;
		fields?: Array<{ name: string; value: string; inline?: boolean; }>;
		footer?: string;
		footerImageUrl?: string;
		image?: string;
		thumbnail?: { url: string };
		title: string; 
		url?: string; 
	}

	export class RichEmbed extends Discord.RichEmbed {
		constructor({ author, color = 0x673888, description, fields, footer, footerImageUrl, image, thumbnail, title, url }: SayEmbedOptions) {
			super({
				author: { icon_url: author.avatarURL, name: author.username }, 
				color,
				description,
				fields,
				footer: { icon_url: footerImageUrl, text: footer },
				image: { url: image },
				thumbnail,
				title, 
				url
			});
		}
	}

	export async function db(parsedCommand: GenericBot.Command.Parser.ParsedCommand): Promise<Discord.Message> {
		try {
			const result: Derpibooru.Response.Image = (parsedCommand.args === "" || parsedCommand.args === "random") ? await Derpibooru.random() : await Derpibooru.search(parsedCommand.args);
			const imagePageUrl: string = Derpibooru.Response.formatImagePageUrl(result);
			return sayEmbed(parsedCommand, {
				description: result.file_name + " uploaded by " + result.uploader,
				footer: result.tags, 
				footerImageUrl: Derpibooru.favIconUrl.toString(), 
				image: Derpibooru.Response.formatImageUrl(result), 
				title: imagePageUrl, 
				url: imagePageUrl
			});
		} catch (e) {
			if (e instanceof Derpibooru.NoponyError)
				return say(parsedCommand, e.message);
			else
				throw e;
		}
	}

	export async function fourChan(parsedCommand: GenericBot.Command.Parser.ParsedCommand): Promise<Discord.Message> {
		let result: FourChan.Catalog.Response.Thread;

		try {
			result = (parsedCommand.args === "" || parsedCommand.args === "random") ? await FourChan.Catalog.random() : await FourChan.Catalog.search(parsedCommand.args);
		} catch (e) {
			if (e instanceof FourChan.FourChanError)
				return say(parsedCommand, e.message);
			else
				throw e;
		}
		const threadSubject: string = FourChan.formatThreadSubject(result);
		const threadUrl: string = FourChan.formatThreadUrl(result);
		const message: RichEmbed = new RichEmbed({
			author: parsedCommand.requester, 
			footer: "Replies: " + result.replies.toString() + " | Images: " + result.images.toString() + " | Page: " + result.pageNumber.toString(),
			footerImageUrl: FourChan.favIconUrl.toString(),
			title: ((threadSubject === "") ? "[UNTITLED]" : threadSubject),
			url: threadUrl
		});
		const comment: string = FourChan.formatPostComment(result);
		message.addField("by " + result.name, (comment.length > 1024) ? comment.slice(0, 1024).concat("\u{2026}") : comment, false);
		message.setThumbnail(FourChan.formatPostImage(result));
		return parsedCommand.channel.sendEmbed(message, undefined, { split: true });
	}

	export async function google(parsedCommand: GenericBot.Command.Parser.ParsedCommand): Promise<Discord.Message> {
		const results: Google.Search.Response = await Google.search(parsedCommand.args);
		const message: RichEmbed = new RichEmbed({
			author: parsedCommand.requester, 
			description: (results.items) ? parsedCommand.args : "Your search - " + parsedCommand.args + " - did not match any documents.",
			footer: "Found " + results.searchInformation.formattedTotalResults + " results in " + results.searchInformation.formattedSearchTime + " seconds.",
			footerImageUrl: Google.favIconUrl.toString(),
			title: "Google Search Results",
			url: Google.genericQueryUrl.setQuery(new Query({ q: parsedCommand.args })).toString()
		});

		if (results.items)
			for (let i: number = 0; i < 3; i++) {
				message.addField(results.items[i].title, results.items[i].link + "\n" + results.items[i].snippet);

				if (!message.thumbnail)
					if (results.items[i].pagemap)
						if (results.items[i].pagemap.cse_thumbnail && results.items[i].pagemap.cse_thumbnail[0].src)
							message.setThumbnail(results.items[i].pagemap.cse_thumbnail[0].src);
						else if (results.items[i].pagemap.cse_image && results.items[i].pagemap.cse_image[0].src)
							message.setThumbnail(results.items[i].pagemap.cse_image[0].src);
			}
		return parsedCommand.channel.sendEmbed(message, undefined, { split: true });
	}

	function isBotOrDmChannel(channel: GenericBot.Command.TextBasedChannel): boolean { return channel instanceof Discord.DMChannel || channel instanceof Discord.GroupDMChannel || channel instanceof Discord.TextChannel && /bot/gi.test(channel.name); }

	export async function ping(parsedCommand: GenericBot.Command.Parser.ParsedCommand): Promise<Discord.Message> {
		if (isBotOrDmChannel(parsedCommand.message.channel))
			return sayEmbed(parsedCommand, {
				description: "Response took: " + DateFormatted.fromTimestamp(Date.now() - parsedCommand.message.createdTimestamp).format() + "; average socket ping: " + DateFormatted.fromTimestamp(parsedCommand.bot.client.ping).format(),
				footer: "\u{1f3d3}",
				title: "Pong!"
			});
		return null;
	}

	export async function say(parsedCommand: GenericBot.Command.Parser.ParsedCommand, message?: string): Promise<Discord.Message> { return <Promise<Discord.Message>>parsedCommand.channel.send(message ? message : parsedCommand.args); }

	export async function sayEmbed(parsedCommand: GenericBot.Command.Parser.ParsedCommand, options: SayEmbedOptions): Promise<Discord.Message> {
		const embedMessage: RichEmbed = new RichEmbed((options.author) ? options : Object.assign(options, { author: parsedCommand.requester }));
		return parsedCommand.channel.sendEmbed(embedMessage, undefined, { split: true });
	}

	class ActiveMessage {
		public readonly message: Discord.Message;
		public reactions: { prev: Discord.MessageReaction, next: Discord.MessageReaction, stop: Discord.MessageReaction };

		constructor(message: Discord.Message) { this.message = message; }

		public async configureReactions() {
			this.reactions = {
				prev: await this.message.react(ActiveMessage.reactionEmoticons.prev),
				next: await this.message.react(ActiveMessage.reactionEmoticons.next),
				stop: await this.message.react(ActiveMessage.reactionEmoticons.stop)
			};
		}
	}

	namespace ActiveMessage {
		export const reactionEmoticons: { prev: string, next: string, stop: string } = { prev: "\u{23ee}", next: "\u{23ed}", stop: "\u{1f5d1}" };
	}

	export async function test(parsedCommand: GenericBot.Command.Parser.ParsedCommand): Promise<Discord.Message> {
		const message: Discord.Message = await sayEmbed(parsedCommand, { description: "testing 1", title: "testing" });
		const reactions: ActiveMessage = new ActiveMessage(message);
		reactions.configureReactions().catch(console.error);
		return message;
	}

	export async function uptime(parsedCommand: GenericBot.Command.Parser.ParsedCommand): Promise<Discord.Message> {
		if (!isBotOrDmChannel(parsedCommand.channel))
			return null;
		const now: Date = new Date();

		return sayEmbed(parsedCommand, {
			description: "As of " + now.toLocaleString() + " I have been up for **" + DateFormatted.fromTimestamp(parsedCommand.bot.client.uptime).format() + "**",
			footer: "\u{1f199}",
			title: parsedCommand.bot.name + " Uptime"
		});
	}
}