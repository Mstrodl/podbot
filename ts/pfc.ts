import { CommandLogger } from "./CommandLogger";
import * as Crypt from "./Crypt";
import * as Discord from "discord.js";
import { GenericBot } from "./GenericBot";
import * as Process from "process";

const name: string = "PFCuckBot";
const topicPrefix: string = "PODCAST TOPIC";
const trigger: string = "!";

Process.send({ name });
const log: CommandLogger = new CommandLogger("podbot");
const commands: GenericBot.Command.Collection = new GenericBot.Command.Collection();
commands.set("any", { command: (parsedCommand: GenericBot.Command.Parser.ParsedCommand): void => { log.add(parsedCommand).catch(console.error); } })
	.set("4chan", { default: true })
	.set("db", { default: true })
	.set("dp", { alias: "db" })
	.set("google", { default: true })
	.set("ping", { default: true })
	.set("say", { default: true })
	.set("test", { default: true })
	.set("topic", { command: (parsedCommand: GenericBot.Command.Parser.ParsedCommand): void => { topic(parsedCommand).catch(console.error); } })
	.set("uptime", { default: true });

async function login() {
	const secrets: Crypt.SecretsBot = await Crypt.getSecrets("pfc");
	const bot: GenericBot = new GenericBot(name, secrets.token, { commands, trigger });
	bot.configure().login();
}

login().catch(console.error);

async function topic(parsedCommand: GenericBot.Command.Parser.ParsedCommand): Promise<Discord.Message> {
	if (!(parsedCommand.channel instanceof Discord.TextChannel) || parsedCommand.channel.name !== "podcast" && parsedCommand.channel.name !== "bot-fuckery")
		return null;
	const messageToPin: Discord.Message = await GenericBot.Command.Defaults.sayEmbed(parsedCommand, {
		description: parsedCommand.args,
		footer: "\u{1f4cc}",
		title: topicPrefix
	});
	messageToPin.pin();
	parsedCommand.message.delete();
	return messageToPin;
}