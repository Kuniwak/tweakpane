import {Emitter} from '../emitter';
import {Ticker} from './ticker';

type EventType = 'tick';

/**
 * @hidden
 */
export class ManualTicker implements Ticker {
	public readonly emitter: Emitter<EventType>;

	constructor() {
		this.emitter = new Emitter();
	}

	public dispose(): void {
		// Do nothing
	}

	public tick(): void {
		this.emitter.emit('tick', [this]);
	}
}
