import { Collection } from "./Collection";
import * as Crypt from "./Crypt";
import * as Discord from "discord.js";
import { GenericApi } from "./GenericApi";
import { GenericBot } from "./GenericBot";
import { Path, Query, Url } from "./Url";
import { Embed, Reactor } from "./Reactor";
import { RichEmbed } from "./RichEmbed";

// https://console.developers.google.com/apis/credentials?project=podbot-1487985738290

// google tz
//https://maps.googleapis.com/maps/api/timezone/json?location=28.419097,-81.228514&timestamp=1489803820&key=

// youtube search
// https://developers.google.com/youtube/v3/docs/search/list
// https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCSA4z111ZYEzsxwNEgrrS7A&maxResults=50&type=video&key=
// https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=PLYwK4VQSqT-v3-7lp-eXaJD62-mrzuaj6&maxResults=50&key=
export const favIconUrl: Url = new Url("https://www.google.com/images/branding/product/ico/googleg_lodp.ico");
export const genericQueryUrl: Url = new Url("https://www.google.com/search");
const url: Url = new Url("https://www.googleapis.com/customsearch/v1");
let query: Query;

export class Search {

}

export class Timezone {

}

export class YouTube implements Reactor.Command, YouTube.Like {
	private _embeds: Array<Embed.Options>;
	public readonly bot: GenericBot;
	public readonly channel: GenericBot.Command.TextBasedChannel;

	public get embeds(): Array<Embed.Options> {
		// if (this._embeds)
			return this._embeds;
		// return this._embeds = this.images.reduce<Array<Embed.Options>>((embeds: Array<Embed.Options>, image: Derpibooru.Image): Array<Embed.Options> => {
		// 	embeds.push({
		// 		description: image.file_name + " uploaded by " + image.uploader,
		// 		footer: { icon_url: Derpibooru.favIconUrl.toString(), text: image.tags },
		// 		image: { url: image.imageUrl },
		// 		title: image.pageUrl,
		// 		url: image.pageUrl }
		// 	);
		// 	return embeds;
		// }, new Array<Embed.Options>());
	}
}

export namespace YouTube {
	export interface Constructor {
		prototype: Like;
	}

	export interface Like {
		constructor: Constructor;
	}

	export namespace Response {
		export interface Items {
			playlistId: string;
			position: number;
			resourceId: Resource;
			snippet?: Snippet;
		}

		export interface PageInfo {
			totalResults: number;
			resultsPerPage: number;
		}

		export interface PlaylistItems {
			items?: Array<Items>;
			pageInfo?: PageInfo;
		}

		export interface Resource { videoId: string; }

		export interface Snippet {
			description: string;
			thumbnails: Thumbnails;
			title: string;
			publishedAt: string;
		}

		export interface Thumbnail {
			height: number;
			url: string;
			width: number;
		}

		export interface Thumbnails {
			default: Thumbnail;
			medium?: Thumbnail;
			high?: Thumbnail;
		}
	}
}



async function getQuery() {
	const secrets: Crypt.SecretsGoogle = await Crypt.getSecrets("Google");
	Object.defineProperty(secrets, "key", Object.getOwnPropertyDescriptor(secrets, "api"));
	delete secrets.api;
	query = new Query(secrets);
}

getQuery().catch(console.error);

async function get<T>(path: string): Promise<T> { return GenericApi.Get.json<T>(url, query.set("q", path)); }
export async function search(query: string): Promise<Search.Response> { return get<Search.Response>(query); }

export namespace Search {
	export interface Response {
		items: Array<ResponseItem>;
		searchInformation: {
			searchTime: number;
			formattedSearchTime: string;
			totalResults: string;
			formattedTotalResults: string;
		};
	}

	export interface ResponseItem {
		displayLink: string;
		formattedUrl: string;
		link: string;
		pagemap: {
			cse_image?: Array<{
				src: string;
			}>;
			cse_thumbnail?: Array<{
				height: string;
				src: string;
				width: string;
			}>;
		};
		snippet: string;
		title: string;
	}
}	