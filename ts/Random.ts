import * as Buffer from "buffer";
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