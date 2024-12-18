import { Notice } from 'obsidian';
import { ArgumentNullException, NotImplementedError } from './exceptions';
import { LogLevel } from './base-plugin-module';

export interface Logger {
	toast(toastLogLevel: LogLevel, ...messages: unknown[]): void;
	trace(toastLogLevel: LogLevel, ...messages: unknown[]): void;
	info(toastLogLevel: LogLevel, ...messages: unknown[]): void;
	debug(toastLogLevel: LogLevel, ...messages: unknown[]): void;
	warn(toastLogLevel: LogLevel, ...messages: unknown[]): void;
	error(toastLogLevel: LogLevel, ...messages: unknown[]): void;
}

export class LoggingFunctions implements Logger {
	protected name: string;

	private logLevel: LogLevel;
	private toastLogLevel: LogLevel;

	private static styles = {
		[LogLevel.None]: { color: '#000000', 'font-weight': 'normal' },
		[LogLevel.Trace]: { color: '#00BFFF', 'font-weight': 'normal' },
		[LogLevel.Info]: { color: '#32CD32', 'font-weight': 'normal' },
		[LogLevel.Debug]: { color: '#FFD700', 'font-weight': 'normal' },
		[LogLevel.Warn]: { color: '#FFA500', 'font-weight': 'bold' },
		[LogLevel.Error]: { color: '#FF6347', 'font-weight': 'bold' },
	};

	private static toastDurations = {
		[LogLevel.None]: 1,
		[LogLevel.Trace]: 1,
		[LogLevel.Debug]: 500,
		[LogLevel.Info]: 500,
		[LogLevel.Warn]: 5000,
		[LogLevel.Error]: 0,
	};

	constructor(name: string, logLevel: LogLevel, toastLogLevel: LogLevel) {
		this.name = name;
		this.logLevel = logLevel;
		this.toastLogLevel = toastLogLevel;
	}

	updateLogLevel(logLevel: LogLevel) {
		this.logLevel = logLevel;
	}

	updateToastLogLevel(toastLogLevel: LogLevel) {
		this.toastLogLevel = toastLogLevel;
	}

	toast(toastLogLevel: LogLevel, ...messages: unknown[]) {
		if (!messages?.length) throw new ArgumentNullException('messages');

		const messagesText =
			messages.length > 1 ? messages.join(' ') : messages[0];
		const fragment = document.createDocumentFragment();

		const messagesElement = document.createElement('span');
		messagesElement.textContent = ` \n${messagesText}`;

		fragment.appendChild(this.getToastNameElement(toastLogLevel));
		fragment.appendChild(messagesElement);

		const duration: number = LoggingFunctions.toastDurations[toastLogLevel];
		new Notice(fragment, duration);
	}

	trace(toastLogLevel: LogLevel, ...messages: unknown[]): void {
		this.handleLog(messages, LogLevel.Trace, toastLogLevel);
	}

	info(toastLogLevel: LogLevel, ...messages: unknown[]): void {
		this.handleLog(messages, LogLevel.Info, toastLogLevel);
	}

	debug(toastLogLevel: LogLevel, ...messages: unknown[]): void {
		this.handleLog(messages, LogLevel.Debug, toastLogLevel);
	}

	warn(toastLogLevel: LogLevel, ...messages: unknown[]): void {
		this.handleLog(messages, LogLevel.Warn, toastLogLevel);
	}

	error(toastLogLevel: LogLevel, ...messages: unknown[]): void {
		this.handleLog(messages, LogLevel.Error, toastLogLevel);
	}

	private handleLog(
		messages: unknown[],
		logLevel: LogLevel,
		toastLogLevel: LogLevel,
	) {
		if (this.logLevel === LogLevel.None) return;
		if (this.logLevel > logLevel) return;
		if (!messages?.length) throw new ArgumentNullException('messages');

		const style: string = this.getStyles(this.logLevel);

		switch (logLevel) {
			case LogLevel.Trace:
				console.trace(`%c${this.name}`, style, messages);
				break;
			case LogLevel.Info:
				console.info(`%c${this.name}`, style, messages);
				break;
			case LogLevel.Debug:
				console.debug(`%c${this.name}`, style, messages);
				break;
			case LogLevel.Warn:
				console.warn(`%c${this.name}`, style, messages);
				break;
			case LogLevel.Error:
				console.error(`%c${this.name}`, style, messages);
				break;
			default:
				throw new NotImplementedError('logLevel');
		}

		if (this.toastLogLevel === LogLevel.None) return;
		if (this.toastLogLevel > toastLogLevel) return;
		this.toast(toastLogLevel, messages);
	}

	private getStyles(logLevel: LogLevel): string {
		const style = LoggingFunctions.styles[logLevel];
		return Object.entries(style)
			.map(([key, value]) => `${key}: ${value}`)
			.join(';');
	}

	private getToastNameElement(logLevel: LogLevel): HTMLSpanElement {
		const pluginNameElement = document.createElement('span');
		const style = LoggingFunctions.styles[logLevel];
		pluginNameElement.style.color = style.color;
		pluginNameElement.style.fontWeight = style['font-weight'];
		pluginNameElement.textContent = `[${this.name}]`;
		return pluginNameElement;
	}
}
