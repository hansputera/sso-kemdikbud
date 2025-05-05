import type { CookieInstance } from '@/types/index.js';
import fs from 'node:fs';
import { gunzipSync, gzipSync } from 'node:zlib';
import { CookieJar } from 'tough-cookie';

export class CookieFileConsumer implements CookieInstance {
	constructor(private readonly cookieFile: string) {}

	async load<T>(): Promise<T> {
		await this.#throwIfNotExists();

		const contents = await fs.promises.readFile(this.cookieFile);
		if (contents.length === 0) {
			return new CookieJar() as T;
		}

		const decoded = gunzipSync(contents);

		if (!decoded) {
			throw new Error(`${CookieFileConsumer.name}#load fail when decode the contents`);
		}

		const jsonnable = this.#jsonnable(decoded.toString('utf8'));
		if (jsonnable) {
			return CookieJar.fromJSON(decoded.toString()) as T;
		}

		return CookieJar.deserialize(decoded.toString()) as T;
	}

	async store<Value>(value: Value): Promise<boolean> {
		await this.#throwIfNotExists();

		let encoded = Buffer.alloc(0);

		if (typeof value === 'object') {
			encoded = Buffer.from(gzipSync(JSON.stringify(value)));
		} else if (typeof value === 'string') {
			encoded = Buffer.from(gzipSync(value));
		}

		const results = await fs.promises
			.writeFile(this.cookieFile, encoded)
			.catch(() => undefined)
			.then(() => 1);
		if (!results) {
			return false;
		}

		return true;
	}

	#jsonnable(value: string): boolean {
		try {
			return Boolean(JSON.parse(value));
		} catch {
			return false;
		}
	}

	async #throwIfNotExists() {
		const stat: fs.Stats | string = await fs.promises
			.stat(this.cookieFile)
			.catch((error: Error) => error.message);
		if (typeof stat === 'string') {
			throw new TypeError(stat);
		}
	}

	public async initIfNotExists(): Promise<void> {
		try {
			await this.#throwIfNotExists();
		} catch {
			await fs.promises.writeFile(this.cookieFile, '');
		}
	}
}
