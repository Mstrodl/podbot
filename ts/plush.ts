import { CommandLogger } from "./CommandLogger";
import * as Crypt from "./Crypt";
import * as Discord from "discord.js";
import * as FourChan from "./FourChan";
import { GenericBot } from "./GenericBot";
import * as Process from "process";

const name: string = "PlushieBot";
const threadMessage: string = "This is my best guess as to where the plush thread is.";
const trigger: string = "!";

Process.send({ name });
const log: CommandLogger = new CommandLogger("plushbot");
const commands: GenericBot.Command.Collection = new GenericBot.Command.Collection();
commands.set("any", { command: (parsedCommand: GenericBot.Command.Parser.ParsedCommand): void => { log.add(parsedCommand).catch(console.error); } })
	.set("4chan", { default: true })
	.set("db", { default: true })
	.set("dp", { alias: "db" })
	.set("ping", { default: true })
	.set("say", { default: true })
	.set("thread", { command: (parsedCommand: GenericBot.Command.Parser.ParsedCommand): void => { thread(parsedCommand).catch(console.error); } })
	.set("uptime", { default: true });

async function login() {
	const secrets: Crypt.SecretsBot = await Crypt.getSecrets("plush");
	const bot: GenericBot = new GenericBot(name, secrets.token, { commands, trigger });
	bot.configure().login();
}

login().catch(console.error);

async function thread(parsedCommand: GenericBot.Command.Parser.ParsedCommand): Promise<Discord.Message> {
	let result: FourChan.Catalog.Response.Thread;

	try {
		try { result = await FourChan.Catalog.search("plush thread"); }
		catch (e) {
			if (e instanceof FourChan.NoThreadError)
				result = await FourChan.Catalog.search("plush");
			else
				throw e;
		}
	} catch (e) {
		if (e instanceof FourChan.FourChanError)
			return GenericBot.Command.Defaults.say(parsedCommand, e.message);
		else
			throw e;
	}
	const threadUrl: string = FourChan.formatThreadUrl(result);
	const message: GenericBot.Command.Defaults.RichEmbed = new GenericBot.Command.Defaults.RichEmbed({
		author: parsedCommand.requester, 
		footer: "Replies: " + result.replies.toString() + " | Images: " + result.images.toString() + " | Page: " + result.pageNumber.toString(),
		footerImageUrl: FourChan.favIconUrl.toString(),
		title: "Plush Thread",
		url: threadUrl
	});
	message.addField(threadUrl, threadMessage, false);

	try { message.setThumbnail(await FourChan.Thread.randomImage(result)); }
	catch (e) {
		if (e instanceof FourChan.Thread.Error)
			delete message.thumbnail;
		else
			throw e;
	}
	parsedCommand.message.delete();
	return parsedCommand.channel.sendEmbed(message, undefined, { split: true });
}