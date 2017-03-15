import { Collection} from "./Collection";
import * as Discord from "discord.js";
import { GenericApi } from "./GenericApi";
import { GenericBot } from "./GenericBot";
import { Path, Query, Url } from "./Url";
import * as Random from "./Random";
import { RichEmbed } from "./RichEmbed";

const filter_id: number = 41048;
const url: Url = new Url("https://derpibooru.org");
export const favIconUrl: Url = url.setPathname(new Path("/favicon.ico"));
const pathname: { search: Path, random: Path } = { search: new Path("/search.json"), random: new Path("/images.json") };
const query: { search: Query, random: Query } = { search: new Query({ filter_id }), random: new Query({ filter_id, random_image: true }) };

export class NoponyError extends Error {}

export class Derpibooru implements Derpibooru.Like, IterableIterator<RichEmbed> {
	private _images: Array<Derpibooru.Image>;
	public readonly bot: GenericBot;
	public readonly channel: GenericBot.Command.TextBasedChannel;
	public embed: RichEmbed;
	private iterator: Iterator<RichEmbed>;
	public readonly message: Discord.Message;
	public readonly parsedCommand: GenericBot.Command.Parser.ParsedCommand;
	public readonly query: Query;
	public readonly type: "random" | "search";
	public readonly url: Url;
	public readonly userInput: string;

	constructor(parsedCommand: GenericBot.Command.Parser.ParsedCommand) {
		if (parsedCommand.args === "" || parsedCommand.args === "random")
			[this.query, this.type, this.url] = [query.random, "random", url.setPathname(pathname.random)];
		else
			[this.query, this.type, this.url, this.userInput] = [query.search.set("q", parsedCommand.args), "search", url.setPathname(pathname.search), parsedCommand.args];
		this.parsedCommand = parsedCommand;
	}

	public get images(): Array<Derpibooru.Image> { return this._images; }

	public set images(images: Array<Derpibooru.Image>) {
		if (typeof images === "undefined")
			return;
		this._images = images.map<Derpibooru.Image>((image: Derpibooru.Image): Derpibooru.Image => {
			if (typeof image.id === "undefined")
				console.log("found undefined image!!!\n", images);
			return Object.defineProperties(image, {
				"imageUrl": { get: function(): string { return Derpibooru.Response.formatImageUrl(this); } },
				"pageUrl": { get: function(): string { return Derpibooru.Response.formatImagePageUrl(this); } }
			});
		});
		this.iterator = this[Symbol.iterator]();
	}

	public setEmbed(image: Derpibooru.Image): this {
		if (typeof image === "undefined")
			this.embed = undefined;
		else
			this.embed = new RichEmbed(this.parsedCommand, {
				description: image.file_name + " uploaded by " + image.uploader, footer: { icon_url: Derpibooru.favIconUrl.toString(), text: image.tags }, image: { url: image.imageUrl }, title: image.pageUrl, url: image.pageUrl
			});
		return this;
	}

	public async fetch() { (this.type === "search") ? await this.search() : await this.random(); }
	private async getImages<T extends Derpibooru.Response.Random | Derpibooru.Response.Search>(): Promise<T> { return GenericApi.Get.json<T>(this.url, this.query); }
	public next(): IteratorResult<RichEmbed> { return this.iterator.next(); }

	public async random() {
		const images: Derpibooru.Response.Random = await this.getImages<Derpibooru.Response.Random>();
		this.images = await Random.shuffle<Derpibooru.Response.Image>(images.images);
	}

	public async search() {
		let images: Derpibooru.Response.Search = await this.getImages<Derpibooru.Response.Search>();

		if (images.total === 0)
			throw new Derpibooru.NoponyError("No images were found for `" + this.userInput + "`");
		console.log("Found " + images.total.toString() + " for search " + this.userInput);
		const pageNumber: number = (images.total > images.search.length) ? (await Random.integer(Math.ceil(images.total / images.search.length)) + 1) : 1;
		console.log("Choosing page number " + pageNumber.toString());

		if (pageNumber > 1) {
			this.query.set("page", pageNumber);
			images = await this.getImages<Derpibooru.Response.Search>();
		}
		const shuffled: Array<Derpibooru.Response.Image> = await Random.shuffle<Derpibooru.Response.Image>(images.search);
		
		if (typeof shuffled[0] === "undefined")
			console.log(shuffled);
		this.images = shuffled;
	}

	public *[Symbol.iterator](): IterableIterator<RichEmbed> {
		for (const image of this.images)
			yield this.setEmbed(image).embed;
	}
}

export namespace Derpibooru {
	export interface Constructor {}

	export interface Image extends Response.Image {
		readonly imageUrl?: string;
		readonly pageUrl?: string;
	}

	export interface Like {
		readonly bot: GenericBot;
		readonly channel?: GenericBot.Command.TextBasedChannel;
		readonly message: Discord.Message;
		readonly query: Query;
		readonly url: Url;
		readonly userInput?: string;
	}

	export class NoponyError extends Error {}

	export const favIconUrl: Url = url.setPathname(new Path("/favicon.ico"));

	export namespace Response {
		export interface Image {
			downvotes: number;
			faves: number;
			file_name: string;
			id: string;
			image: string;
			score: number;
			tags: string;
			uploader: string;
			upvotes: number;
		}

		export interface Random { images: Array<Image>; }

		export interface Search {
			search: Array<Image>;
			total: number;
		}

		export function formatImagePageUrl(image: Image): string { return url.setPathname(new Path("/" + image.id)).toString(); }
		export function formatImageUrl(image: Image): string { return Url.parse(image.image, true).setProtocol("https:").toString(); }
	}
}