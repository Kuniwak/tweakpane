import {Constraint} from '../constraint/constraint';
import {Emitter} from './emitter';

export namespace ProposedSolution {
	export interface ValueEvents<T> {
		change: {
			sender: Value<T>;
			rawValue: T;
		};
	}

	export interface Value<T> {
		readonly emitter: Emitter<ValueEvents<T>>;
		rawValue: T;
	}

	export class RawValue<T> implements Value<T> {
		public readonly emitter: Emitter<ValueEvents<T>> = new Emitter();
		private rawValue_: T;

		constructor(initialValue: T) {
			this.rawValue_ = initialValue;
		}

		public get rawValue(): T {
			return this.rawValue_;
		}

		public set rawValue(rawValue: T) {
			this.rawValue_ = rawValue;
			this.emitter.emit('change', {
				rawValue: rawValue,
				sender: this,
			});
		}
	}

	export class DistinctValue<T> implements Value<T> {
		constructor(
			private value: Value<T>,
			private equals: (oldValue: T, newValue: T) => boolean,
		) {}

		public get emitter() {
			return this.value.emitter;
		}

		public get rawValue() {
			return this.value.rawValue;
		}

		public set rawValue(newValue: T) {
			const oldValue = this.value.rawValue;

			if (!this.equals(oldValue, newValue)) {
				return;
			}

			this.value.rawValue = newValue;
		}
	}

	export class ConstrainedValue<T> implements Value<T> {
		constructor(private value: Value<T>, private constraint: Constraint<T>) {
		}

		public get emitter() {
			return this.value.emitter;
		}

		public get rawValue() {
			return this.value.rawValue;
		}

		public set rawValue(newValue: T) {
			this.value.rawValue = this.constraint.constrain(newValue);
		}
	}
}
