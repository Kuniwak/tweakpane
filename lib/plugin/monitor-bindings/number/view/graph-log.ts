import {Formatter} from '../../../common/converter/formatter';
import {SVG_NS} from '../../../common/dom-util';
import {Buffer, BufferedValue} from '../../../common/model/buffered-value';
import {mapRange} from '../../../common/number-util';
import {ClassName} from '../../../common/view/class-name';
import {ValueView} from '../../../common/view/value';
import {GraphCursor} from '../model/graph-cursor';

interface Config {
	cursor: GraphCursor;
	formatter: Formatter<number>;
	lineCount: number;
	maxValue: number;
	minValue: number;
	value: BufferedValue<number>;
}

const className = ClassName('grl');

/**
 * @hidden
 */
export class GraphLogView implements ValueView<Buffer<number>> {
	public readonly element: HTMLElement;
	public readonly value: BufferedValue<number>;
	private cursor_: GraphCursor;
	private formatter_: Formatter<number>;
	private lineElem_: Element;
	private maxValue_: number;
	private minValue_: number;
	private svgElem_: Element;
	private tooltipElem_: HTMLElement;

	constructor(doc: Document, config: Config) {
		this.onCursorChange_ = this.onCursorChange_.bind(this);
		this.onValueUpdate_ = this.onValueUpdate_.bind(this);

		this.element = doc.createElement('div');
		this.element.classList.add(className());

		this.formatter_ = config.formatter;
		this.minValue_ = config.minValue;
		this.maxValue_ = config.maxValue;

		this.cursor_ = config.cursor;
		this.cursor_.emitter.on('change', this.onCursorChange_);

		const svgElem = doc.createElementNS(SVG_NS, 'svg');
		svgElem.classList.add(className('g'));
		svgElem.style.height = `calc(var(--unit-size) * ${config.lineCount})`;
		this.element.appendChild(svgElem);
		this.svgElem_ = svgElem;

		const lineElem = doc.createElementNS(SVG_NS, 'polyline');
		this.svgElem_.appendChild(lineElem);
		this.lineElem_ = lineElem;

		const tooltipElem = doc.createElement('div');
		tooltipElem.classList.add(className('t'));
		this.element.appendChild(tooltipElem);
		this.tooltipElem_ = tooltipElem;

		config.value.emitter.on('change', this.onValueUpdate_);
		this.value = config.value;

		this.update();
	}

	get graphElement(): Element {
		return this.svgElem_;
	}

	public update(): void {
		const bounds = this.svgElem_.getBoundingClientRect();

		// Graph
		const maxIndex = this.value.rawValue.length - 1;
		const min = this.minValue_;
		const max = this.maxValue_;
		const points: string[] = [];
		this.value.rawValue.forEach((v, index) => {
			if (v === undefined) {
				return;
			}
			const x = mapRange(index, 0, maxIndex, 0, bounds.width);
			const y = mapRange(v, min, max, bounds.height, 0);
			points.push([x, y].join(','));
		});
		this.lineElem_.setAttributeNS(null, 'points', points.join(' '));

		// Cursor
		const tooltipElem = this.tooltipElem_;
		const value = this.value.rawValue[this.cursor_.index];
		if (value === undefined) {
			tooltipElem.classList.remove(className('t', 'valid'));
			return;
		}
		tooltipElem.classList.add(className('t', 'valid'));

		const tx = mapRange(this.cursor_.index, 0, maxIndex, 0, bounds.width);
		const ty = mapRange(value, min, max, bounds.height, 0);
		tooltipElem.style.left = `${tx}px`;
		tooltipElem.style.top = `${ty}px`;
		tooltipElem.textContent = `${this.formatter_(value)}`;
	}

	private onValueUpdate_(): void {
		this.update();
	}

	private onCursorChange_(): void {
		this.update();
	}
}
