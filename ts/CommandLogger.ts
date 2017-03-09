import * as Discord from "discord.js";
import { GenericBot } from "./GenericBot";
import * as Mongo from "mongodb";
import { Path } from "./Url";

const serverUrl: string = "mongodb://[::1]:27017";

export class CommandLogger implements CommandLogger.Like {
	private log: Promise<Mongo.Collection>;
	private readonly logCollectionName: string;
	private readonly db: Promise<Mongo.Db>;

	constructor(db: string, logCollectionName: string = "commandLog") {
		console.log("connecting to mongodb...");
		const path: Path = new Path("/" + db);
		this.logCollectionName = logCollectionName;
		this.db = Mongo.MongoClient.connect(serverUrl + path.toString());
	}

	public async configureLog(logCollectionName: string = this.logCollectionName) { this.log = (await this.db).collection(logCollectionName); }

	public async add(parsedCommand: GenericBot.Command.Parser.ParsedCommand) {
		if (!this.log)
			await this.configureLog();
		const log: CommandLogger.Entry = {
			commandDateTime: new Date(),
			user: parsedCommand.requester.username,
			message: parsedCommand.message.content
		};

		if (!(parsedCommand.channel instanceof Discord.DMChannel))
			log.channel = parsedCommand.channel.name;

		if (parsedCommand.channel instanceof Discord.TextChannel)
			log.guild = parsedCommand.message.guild.name;
		(await this.log).insertOne(log);
	}
}

export namespace CommandLogger {
	export interface Constructor { new(db: string, logCollectionName?: string): CommandLogger; }

	export interface Entry {
		channel?: string;
		commandDateTime: Date;
		guild?: string;
		message: string;
		user: string;
	}

	export interface Like {
		configureLog(logCollectionName?: string): void;
		add(parsedCommand: GenericBot.Command.Parser.ParsedCommand): void;
	}
}