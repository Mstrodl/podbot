import * as Random from "./Random";

//https://discord.js.org/#/docs/main/stable/class/Collection

namespace Unproxied {
	export class Collection<Key, Value> implements Collection.Like<Key, Value> {
		public readonly id: Symbol;
		private cache: { keys?: Array<Key>, values?: Array<Value> };
		private readonly collection: Map<Key, Value>;

		constructor(iterable?: Iterable<[Key, Value]>) {
			this.cache = {};
			this.collection = new Map<Key, Value>(iterable);
			this.id = Symbol();
		}

		public get length(): number { return this.size; }
		public get size(): number { return this.collection.size; }
		public get[Symbol.species](): any { return this.constructor; }
		public get[Symbol.toStringTag](): string { return "Collection"; }

		public array(): Array<Value> { return this.cache.values || (this.cache.values = Array.from(this.collection.values())); }

		public clear(): void {
			this.collection.clear();
			this.cache = { keys: undefined, values: undefined };
		}

		public clone(): Collection<Key, Value> { return new Collection<Key, Value>(this); }

		public concat(...collections: Array<Collection<Key, Value>>): Collection<Key, Value> {
			const result: Collection<Key, Value> = this.clone();

			for (const collection of collections)
				collection.forEach((element: Value, index: Key): void => { result.set(index, element) });
			return result;
		}

		public delete(key: Key): boolean {
			this.cache = { keys: undefined, values: undefined };
			return this.collection.delete(key);
		}

		public deleteAll(): void {
			this.forEach((element: Value): void => {
				if (element != undefined && (typeof (<any>element).deleteAll === "function" || Object.prototype.toString.call((<any>element).deleteAll) === "[object Function]"))
					(<{ deleteAll(): any }>(<any>element)).deleteAll();
			});
		}

		public *entries(): Iterator<Collection.Item<Key, Value>> {
			const entries: Iterator<Collection.Item<Key, Value>> = this.collection.entries();
			let entry: IteratorResult<Collection.Item<Key, Value>> = entries.next();

			for (; !entry.done; entry = entries.next()) {
				const result: Collection.Item<Key, Value> = entry.value;
				[result.key, result.value] = [result[0], result[1]];
				yield result;
			}
			yield entry.value;
		}

		public equals(collection: Collection<Key, Value>): boolean {
			if (this.size !== collection.size)
				return false;
			return this.every((currentValue: Value, index: Key): boolean => collection.exists(index, currentValue));
		}

		public exists(key: Key, value: Value): boolean { return this.has(key) && this.get(key) === value; }
		public every(callback: Collection.Callback<Key, Value, this, boolean>, thisArg?: Object): boolean { return this.forTestShortcut(callback, true, thisArg); }

		public filter(callback: Collection.Callback<Key, Value, this, boolean>, thisArg?: Object): Collection<Key, Value> {
			return this.reduce<Collection<Key, Value>>((accumulator: Collection<Key, Value>, element: Value, index: Key): Collection<Key, Value> => {
				if (callback.call(thisArg, element, index, this))
					accumulator.set(index, element);
				return accumulator;
			}, new Collection<Key, Value>());
		}

		public filterArray(callback: Collection.Callback<Key, Value, this, boolean>, thisArg?: Object): Array<Value> { return this.filter(callback, thisArg).array(); }
		public find(property: string, value: any): Value;
		public find(callback: Collection.Callback<Key, Value, this, boolean>, thisArg?: Object): Value;
		public find(propertyOrCallback: string | Collection.Callback<Key, Value, this, boolean>, valueOrThisArg?: any | Object): Value { return this.findItem(propertyOrCallback, valueOrThisArg)[1]; }
		public findAll(property: string, value: any): Array<Value> { return this.filterArray((element: Value): boolean => element[property] === value); }

		private findItem(propertyOrCallback: string | Collection.Callback<Key, Value, this, boolean>, valueOrThisArg?: any | Object): Collection.Item<Key, Value> {
			let callback: Collection.Callback<Key, Value, this, boolean>;
			let thisArg: Object;

			if (typeof propertyOrCallback === "string")
				callback = (element: Value): boolean => element[propertyOrCallback] === valueOrThisArg;
			else
				[callback, thisArg] = [propertyOrCallback, valueOrThisArg];

			return this.forShortcut(callback, false, thisArg);
		}

		public findKey(property: string, value: any): Key | number;
		public findKey(callback: Collection.Callback<Key, Value, this, boolean>, thisArg?: Object): Key | number;
		public findKey(propertyOrCallback: string | Collection.Callback<Key, Value, this, boolean>, valueOrThisArg?: any | Object): Key | number { return this.findItem(propertyOrCallback, valueOrThisArg)[0] || -1; }
		public first(): Value { return this.values().next().value; }
		public firstKey(): Key { return this.keys().next().value; }
		public forEach(callback: Collection.Callback<Key, Value, this, void>, thisArg?: Object): void { this.collection.forEach(<any>callback, thisArg); }

		private forShortcut(callback: Collection.Callback<Key, Value, this, boolean>, useReverseLogic: boolean = false, thisArg?: Object): Collection.Item<Key, Value> {
			for (const item of this)
				if (callback.call(thisArg, item.value, item.key, this) === !useReverseLogic)
					return useReverseLogic ? undefined : item;
			return useReverseLogic ? [undefined, undefined] : undefined;
		}

		private forTestShortcut(callback: Collection.Callback<Key, Value, this, boolean>, useReverseLogic: boolean = false, thisArg?: Object): boolean { return Boolean(this.forShortcut(callback, useReverseLogic, thisArg)); }
		public get(key: Key): Value { return this.collection.get(key); }
		public has(key: Key): boolean { return this.collection.has(key); }
		public keys(): Iterator<Key> { return this.collection.keys(); }
		public keyArray(): Array<Key> { return this.cache.keys || (this.cache.keys = Array.from(this.collection.keys())); }
		public last(): Value { return this.array().slice(-1)[0]; }
		public lastKey(): Key { return this.keyArray().slice(-1)[0]; }

		public map<NewValue>(callback: Collection.Callback<Key, Value, this, NewValue>, thisArg?: Object): Collection<Key, NewValue> {
			return this.reduce<Collection<Key, NewValue>>((result: Collection<Key, NewValue>, element: Value, index: Key): Collection<Key, NewValue> => 
				result.set(index, callback.call(thisArg, element, index, this)
			), new Collection<Key, NewValue>());
		}

		public async random(): Promise<Value> { return this.array()[await Random.integer(this.size)]; }
		public async randomKey(): Promise<Key> { return this.keyArray()[await Random.integer(this.size)]; }

		public reduce<T>(callback: (accumulator: T, element: Value, index: Key, collection: this) => T, initialValue?: T): T {
			let result: T = initialValue;
			this.forEach((element: Value, index: Key): void => { result = callback.call(undefined, result, element, index, this) });
			return result;
		}

		public set(key: Key, value: Value): this {
			if (this.size !== this.collection.set(key, value).size)
				this.cache.keys = undefined;
			this.cache.values = undefined;
			return this;
		}

		public some(callback: Collection.Callback<Key, Value, this, boolean>, thisArg?: Object): boolean { return this.forTestShortcut(callback, false, thisArg); }
		public values(): Iterator<Value> { return this.collection.values(); }
		public [Symbol.iterator](): Iterator<Collection.Item<Key, Value>> { return this.entries(); }
	}

	export namespace Collection {
		export type Callback<Key, Value, This extends Collection<Key, Value>, Return> = (element: Value, index: Key, collection: This) => Return;
		export type Item<Key, Value> = Array<Key | Value> & [Key, Value] & { key?: Key, value?: Value };

		export interface Constructor {}

		export interface Like<Key, Value> {}
	}
}

export type Collection<Key, Value> = Unproxied.Collection<Key, Value>;
export const Collection: typeof Unproxied.Collection = new Proxy<typeof Unproxied.Collection>(Unproxied.Collection, {
	construct: <Key, Value>(target: typeof Unproxied.Collection, argumentsList: Array<any>, newTarget: typeof Unproxied.Collection): Unproxied.Collection<Key, Value> => {
		return new Proxy<Unproxied.Collection<Key, Value>>(new Unproxied.Collection<Key, Value>(argumentsList[0]), {
			get: (target: Unproxied.Collection<Key, Value>, property: any, receiver: Unproxied.Collection<Key, Value>): any => 
				Reflect.apply(target.has, target, Array.of(property)) ? Reflect.apply(target.get, target, Array.of(property)) : Reflect.get(target, property),
			has: (target: Unproxied.Collection<Key, Value>, property: any): boolean => Reflect.apply(target.has, target, Array.of(property)) || Reflect.has(target, property),
			set: (target: Unproxied.Collection<Key, Value>, property: any, value: any, receiver: Unproxied.Collection<Key, Value>): boolean => Boolean(Reflect.apply(target.set, target, Array.of(property, value)))
		});
	}
});