import {Constraint} from '../constraint/constraint';
import {Emitter} from '../misc/emitter';

/**
 * @hidden
 */
export interface ValueEvents<In> {
	change: {
		sender: Value<In>;
		rawValue: In;
	};
}

interface ValueConfig<T> {
	constraint?: Constraint<T>;
	equals?: (v1: T, v2: T) => boolean;
}

/**
 * @hidden
 */
export class Value<T> {
	public readonly emitter: Emitter<ValueEvents<T>>;
	private constraint_: Constraint<T> | undefined;
	private equals_: (v1: T, v2: T) => boolean;
	private rawValue_: T;

	constructor(initialValue: T, config?: ValueConfig<T>) {
		this.constraint_ = config?.constraint;
		this.equals_ = config?.equals ?? ((v1, v2) => v1 === v2);
		this.emitter = new Emitter();
		this.rawValue_ = initialValue;
	}

	get constraint(): Constraint<T> | undefined {
		return this.constraint_;
	}

	get rawValue(): T {
		return this.rawValue_;
	}

	set rawValue(rawValue: T) {
		const constrainedValue = this.constraint_
			? this.constraint_.constrain(rawValue)
			: rawValue;

		const changed = !this.equals_(this.rawValue_, constrainedValue);
		if (changed) {
			this.rawValue_ = constrainedValue;
			this.emitter.emit('change', {
				rawValue: constrainedValue,
				sender: this,
			});
		}
	}
}