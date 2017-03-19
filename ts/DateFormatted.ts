// add ms if the number of seconds is < 1

String.prototype.padStart = String.prototype.padStart || function (targetLength: number, padString: string = " "): string {
	if (this.length > targetLength)
		return this;
	const charactersToAdd: number = targetLength - this.length;
	let prefix: string = padString.repeat(charactersToAdd / padString.length);
	return prefix.substr(0, charactersToAdd) + this;
};

export class DateFormatted extends Date implements DateFormatted.Like {
	public static fromTimestamp(timestamp: number): DateFormatted { return new this(timestamp); }

	public format(): string {
		const result: string = this.Dimension.format(this.getFullYear() - 1970, " year", ", ")
			.concat(this.Dimension.format(this.getMonth(), " month", ", "))
			.concat(this.Dimension.format(this.getDate() - 1, " day", ", "))
			.concat(this.Dimension.format(this.getHours(), "", ":"))
			.concat(this.Dimension.format(this.getMinutes(), "", ":", 2));

		if (result.length === 0)
			return this.Dimension.format(this.getSeconds(), "", ".", 0, false).concat(this.Dimension.format(this.getMilliseconds(), " second", "", 3, false));
		else
			return result.concat(this.Dimension.format(this.getSeconds(), "", ".", 2, false)).concat(this.Dimension.format(this.getMilliseconds(), "", "", 3, false));
	}

	private Dimension: DateFormatted.DimensionConstructor = class Dimension implements DateFormatted.DimensionLike {
		public static format(num: number, unitName: string, delimiter: string, numericPadding: number = 0, isOptional: boolean = true): string { return (new this(unitName, delimiter, numericPadding, isOptional))._format(num); }

		constructor(private unitName: string, private delimiter: string, private numericPadding: number = 0, private isOptional: boolean = true) {}

		public _format(num: number): string {
			let suffix: string = this.unitName;

			if (this.isOptional && num === 0)
				return "";
			else if (this.unitName.length > 0)
				suffix = this.unitName + (num === 0 ? "" : "s");
			return num.toString().padStart(this.numericPadding, "0").concat(suffix).concat(this.delimiter);
		}
	}
}

export namespace DateFormatted {
	export interface Constructor { fromTimestamp(timestamp: number): DateFormatted; }

	export interface DimensionConstructor {
		new(unitName: string, delimiter: string, numericPadding?: number, isOptional?: boolean): DimensionLike;
		format(num: number, unitName: string, delimiter: string, numericPadding?: number, isOptional?: boolean): string;
	}

	export interface DimensionLike { _format(num: number): string; }
	export interface Like { format(): string; }
}