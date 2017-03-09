import { GenericApi } from "./GenericApi";
import { Path, Query, Url } from "./Url";
import * as Random from "./Random";

// change layout, put link in header and the title/uploader in footer

const filter_id: number = 41048;
const url: Url = new Url("https://derpibooru.org");
export const favIconUrl: Url = url.setPathname(new Path("/favicon.ico"));
const pathname: { search: Path, random: Path } = { search: new Path("/search.json"), random: new Path("/images.json") };
const query: { search: Query, random: Query } = { search: new Query({ filter_id }), random: new Query({ filter_id, random_image: true }) };

export class NoponyError extends Error {}

export async function random(): Promise<Response.Image> {
	const images: Response.Random = await GenericApi.Get.json<Response.Random>(url.setPathname(pathname.random), query.random);
	return images.images[await Random.integer(images.images.length)];
}

export async function search(search: string): Promise<Response.Image> {
	const images: Response.Search = await GenericApi.Get.json<Response.Search>(url.setPathname(pathname.search), query.search.set("q", search));

	if (images.total === 0)
		throw new NoponyError("No images were found for `" + search + "`");
	return images.search[await Random.integer(images.search.length)];
}

export namespace Response {
	export interface Image {
		file_name: string;
		id: string;
		image: string;
		score: number;
		uploader: string;
	}

	export interface Random { images: Array<Image>; }

	export interface Search {
		search: Array<Image>;
		total: number;
	}

	export function formatImagePageUrl(image: Image): string { return url.setPathname(new Path("/" + image.id)).toString(); }
	export function formatImageUrl(image: Image): string { return Url.parse(image.image, true).setProtocol("https:").toString(); }
}