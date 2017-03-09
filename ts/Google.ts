import * as Crypt from "./Crypt";
import { GenericApi } from "./GenericApi";
import { Query, Url } from "./Url";

export const favIconUrl: Url = new Url("https://www.google.com/images/branding/product/ico/googleg_lodp.ico");
export const genericQueryUrl: Url = new Url("https://www.google.com/search");
const url: Url = new Url("https://www.googleapis.com/customsearch/v1");
let query: Query;

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