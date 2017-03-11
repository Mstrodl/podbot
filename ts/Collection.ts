import * as Random from "./Random";

//https://discord.js.org/#/docs/main/stable/class/Collection

namespace Unproxied {
	export class Collection<Key, Value> extends Map<Key, Value> implements Collection.Like<Key, Value> {
		public readonly id: Symbol;

		public static from<Key, Value>(iterable?: Iterable<[Key, Value]>): Collection<Key, Value> {
			return new Proxy<Collection<Key, Value>>(new this<Key, Value>(iterable), {
				get: (target: Collection<Key, Value>, property: any, receiver: Collection<Key, Value>): any => { return (target.has(property)) ? target.get(property) : target[property]; },
				has: (target: Collection<Key, Value>, property: any): boolean => { return target.has(property) || target[property]; },
				set: (target: Collection<Key, Value>, property: any, value: any, receiver: Collection<Key, Value>): boolean => { return Boolean(target.set(property, value)); }
			});
		}

		constructor(iterable?: Iterable<[Key, Value]>) {
			super(iterable);
			this.id = Symbol();
		}

		public get length(): number { return this.size; }

		public array(): Array<Value> { return Array.from(super.values()); } // this should be cached to match the Discord.Collection API
		public clone(): Collection<Key, Value> { return new Collection<Key, Value>(this); }

		public concat(...collections: Array<Collection<Key, Value>>): Collection<Key, Value> {
			const result: Collection<Key, Value> = this.clone();

			for (const collection of collections)
				collection.forEach((element: Value, index: Key): void => { result.set(index, element) });
			return result;
		}

		public deleteAll(): void { super.clear(); } // the Discord.Collection object actually just iterates through running deleteAll for each object stored in the Collection

		public equals(collection: Collection<Key, Value>): boolean {
			if (this.size !== collection.size)
				return false;
			return this.every((currentValue: Value, index: Key): boolean => collection.exists(index, currentValue));
		}

		public exists(key: Key, value: Value): boolean { return super.has(key) && super.get(key) === value; }
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
		public first(): Value { return super.values().next().value; }
		public firstKey(): Key { return super.keys().next().value; }

		public forEach(callback: Collection.Callback<Key, Value, this, void>, thisArg?: Object): void {
			for (const item of this)
				callback.call(thisArg, item[1], item[0], this);
		}

		private forShortcut(callback: Collection.Callback<Key, Value, this, boolean>, useReverseLogic: boolean = false, thisArg?: Object): Collection.Item<Key, Value> {
			for (const item of this) {
				if (callback.call(thisArg, item[1], item[0], this) === !useReverseLogic)
					return useReverseLogic ? undefined : item;
			}
			return useReverseLogic ? [undefined, undefined] : undefined;
		}

		private forTestShortcut(callback: Collection.Callback<Key, Value, this, boolean>, useReverseLogic: boolean = false, thisArg?: Object): boolean { return Boolean(this.forShortcut(callback, useReverseLogic, thisArg)); }
		public keyArray(): Array<Key> { return Array.from(super.keys()); } // this should be cached to match the Discord.Collection API
		public last(): Value { return this.array().slice(-1)[0]; }
		public lastKey(): Key { return this.keyArray().slice(-1)[0]; }

		public map<NewValue>(callback: Collection.Callback<Key, Value, this, NewValue>, thisArg?: Object): Collection<Key, NewValue> {
			return this.reduce<Collection<Key, NewValue>>((result: Collection<Key, NewValue>, element: Value, index: Key): Collection<Key, NewValue> => 
				result.set(index, callback.call(thisArg, element, index, this)
			), new Collection<Key, NewValue>());
		}

		public async random(): Promise<Value> {
			const array: Array<Value> = this.array();
			return array[await Random.integer(array.length)];
		}

		public async randomKey(): Promise<Key> {
			const array: Array<Key> = this.keyArray();
			return array[await Random.integer(array.length)];
		}

		public reduce<T>(callback: (accumulator: T, element: Value, index: Key, collection: this) => T, initialValue?: T): T {
			let result: T = initialValue;
			this.forEach((element: Value, index: Key): void => { result = callback.call(undefined, result, element, index, this) });
			return result;
		}

		public some(callback: Collection.Callback<Key, Value, this, boolean>, thisArg?: Object): boolean { return this.forTestShortcut(callback, false, thisArg); }
	}

	export namespace Collection {
		export type Callback<Key, Value, This extends Collection<Key, Value>, Return> = (element: Value, index: Key, collection: This) => Return;
		export type Item<Key, Value> = Array<Key | Value> & [Key, Value];

		export interface Constructor {}

		export interface Like<Key, Value> {
		}
	}
}

export const Collection: typeof Unproxied.Collection = new Proxy<typeof Unproxied.Collection>(Unproxied.Collection, {
	construct: <Key, Value>(target: typeof Unproxied.Collection, argumentsList: Array<any>, newTarget: typeof Unproxied.Collection): Unproxied.Collection<Key, Value> => {
		return new Proxy<Unproxied.Collection<Key, Value>>(new Unproxied.Collection<Key, Value>(argumentsList[0]), {
			get: (target: Unproxied.Collection<Key, Value>, property: any, receiver: Unproxied.Collection<Key, Value>): any => { return (target.has(property)) ? target.get(property) : target[property]; },
			has: (target: Unproxied.Collection<Key, Value>, property: any): boolean => { return target.has(property) || target[property]; },
			set: (target: Unproxied.Collection<Key, Value>, property: any, value: any, receiver: Unproxied.Collection<Key, Value>): boolean => { return Boolean(receiver.set(property, value)); }
		});
	}
});

const fubar: Unproxied.Collection<string, string> = new Unproxied.Collection<string, string>();
fubar.set("key1", "vlue1").set("key2", "value2").set("key3", "value3").set("key4", "vlue4").set("key5", "value5").set("key6", "vlue6").set("key7", "value7").set("key8", "value8").set("key9", "value9");
console.log(fubar);

const bar: Unproxied.Collection<string, string> = Unproxied.Collection.from<string, string>();
bar["key1"] = "vlue1";
bar["key2"] = "value2";
bar["key3"] = "value3";
bar["key4"] = "vlue4";
bar["key5"] = "value5";
bar["key6"] = "vlue6";
bar["key7"] = "value7";
bar["key8"] = "value8";
bar["key9"] = "value9";
console.log(bar);