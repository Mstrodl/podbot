import * as Buffer from "buffer";
import { Collection } from "./Collection";
import * as Crypto from "crypto";

export async function integer(upperLimit: number): Promise<number> {
	if (upperLimit <= 0)
		return upperLimit;
	const numBytes: number = (upperLimit === 1) ? 1 : Math.ceil(Math.log2(upperLimit) / 8);
	const randomBytes: string = await new Promise<string>((resolve: (value: string | PromiseLike<string>) => void, reject: (reason?: any) => void): void => Crypto.randomBytes(numBytes, (err: Error, buff: Buffer): void => {
		if (err)
			reject(err);
		else
			resolve(buff.toString("hex"));
	}));
	const randomNum: number = Number.parseInt(randomBytes, 16);
	return randomNum / (1 << (numBytes << 3)) * upperLimit >>> 0;
}

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
export async function shuffle<Value>(array: Array<Value>): Promise<Array<Value>>;
export async function shuffle<Value>(arrayLike: ArrayLike<Value>): Promise<Array<Value>>;
export async function shuffle<Value>(iterable: Iterable<Value>): Promise<Iterable<Value>>;
export async function shuffle<Value>(iterator: Iterator<Value>): Promise<Iterator<Value>>;
export async function shuffle<Value>(arrayOrArrayLikeOrIterableOrIterator: Array<Value> | ArrayLike<Value> | Iterable<Value> | Iterator<Value>): Promise<Array<Value> | Iterable<Value> | Iterator<Value>> {
	if (Array.isArray(arrayOrArrayLikeOrIterableOrIterator))
		return shuffleArray<Value>(arrayOrArrayLikeOrIterableOrIterator);
	if (arrayOrArrayLikeOrIterableOrIterator["length"] && (typeof arrayOrArrayLikeOrIterableOrIterator[0] !== "undefined" || arrayOrArrayLikeOrIterableOrIterator["length"] === 0))
		return shuffleArrayLike<Value>(<ArrayLike<Value>>arrayOrArrayLikeOrIterableOrIterator);
	else if (arrayOrArrayLikeOrIterableOrIterator[Symbol.iterator]) {
		return shuffleIterable(<Iterable<Value>>arrayOrArrayLikeOrIterableOrIterator);
	} else if (arrayOrArrayLikeOrIterableOrIterator["next"]) {
		return shuffleIterator(<Iterator<Value>>arrayOrArrayLikeOrIterableOrIterator);
	}
	return null;
}

async function shuffleArray<Value>(array: Array<Value>): Promise<Array<Value>> {
	if (array.length <= 1)
		return array;
	return Promise.all(await array.reduce<Promise<Array<Promise<Value>>>>(async (final: Promise<Array<Promise<Value>>>, value: Value, i: number): Promise<Array<Promise<Value>>> => {
		const j: number = await integer(i);
		const result: Array<Promise<Value>> = await final;

		if (i !== j)
			result[i] = result[j];
		result[j] = Promise.resolve(value);
		return result;
	}, Promise.resolve(new Array<Promise<Value>>(array.length))));
}

async function shuffleArrayLike<Value>(arrayLike: ArrayLike<Value>): Promise<Array<Value>> { return shuffleArray<Value>(Array.from(arrayLike)); }
async function shuffleIterable<Value>(iterable: Iterable<Value>): Promise<Iterable<Value>> { return shuffleIteratorToIteratable<Value>(iterable[Symbol.iterator]());}
async function shuffleIterator<Value>(iterator: Iterator<Value>): Promise<Iterator<Value>> { return shuffleIteratorToIteratable<Value>(iterator); }

async function shuffleIteratorToIteratable<Value>(iterator: Iterator<Value>): Promise<IterableIterator<Value>> {
	const array: Array<Value> = new Array<Value>();

	for (let result: IteratorResult<Value> = iterator.next(); !result.done; result = iterator.next()) {
		const j: number = await integer(array.length);

		if (j === array.length)
			array.push(result.value);
		else {
			array.push(array[j]);
			array[j] = result.value;
		}
	}
	return array[Symbol.iterator]();
}