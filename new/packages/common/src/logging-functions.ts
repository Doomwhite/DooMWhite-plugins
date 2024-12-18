/* eslint-disable @typescript-eslint/no-explicit-any */
import { Notice } from 'obsidian';
import { NotImplementedError } from './exceptions';
import { LogLevel } from './base-plugin-module';

export interface Logger {
	toast(logLevel: LogLevel, message: any | any[], duration?: number): void;
	trace(message: any | any[], showToast?: boolean, duration?: number): void;
	info(message: any | any[], showToast?: boolean, duration?: number): void;
	debug(message: any | any[], showToast?: boolean, duration?: number): void;
	warn(methodName: string, error: unknown): void;
	error(methodName: string, error: unknown): void;
}

export class LoggingFunctions implements Logger {
	protected name: string;

	// Define styles for each log level with correct CSS properties
	private static styles = {
		[LogLevel.Trace]: { color: '#00BFFF', 'font-weight': 'normal' },
		[LogLevel.Info]: { color: '#32CD32', 'font-weight': 'normal' },
		[LogLevel.Debug]: { color: '#FFD700', 'font-weight': 'normal' },
		[LogLevel.Warn]: { color: '#FFA500', 'font-weight': 'bold' },
		[LogLevel.Error]: { color: '#FF6347', 'font-weight': 'bold' },
	};

	constructor(name: string) {
		this.name = name;
	}

	// Helper method to get styles for a log level
	private getStyles(logLevel: LogLevel): string {
		const style = LoggingFunctions.styles[logLevel];
		return Object.entries(style).map(([key, value]) => `${key}: ${value}`).join(';');
	}

	// Helper method to create the styled plugin name element
	private getToastNameElement(logLevel: LogLevel): HTMLSpanElement {
		const pluginNameElement = document.createElement('span');
		const style = LoggingFunctions.styles[logLevel];
		pluginNameElement.style.color = style.color;
		pluginNameElement.style.fontWeight = style['font-weight'];
		pluginNameElement.textContent = `[${this.name}]`;
		return pluginNameElement;
	}

	// Helper method to get formatted error messages
	getErrorMessage(error: any, fnName: string): string {
		const errorMessage = error instanceof Error
			? `${error.message}\n${error.stack}`
			: String(error);
		return `Error in ${fnName}: ${errorMessage}`;
	}

	// Helper method to show toast notifications
	toast(logLevel: LogLevel, message: string, duration: number = 0) {
		const fragment = document.createDocumentFragment();

		// Create and append the styled plugin name and message elements
		const messageElement = document.createElement('span');
		messageElement.textContent = ` \n${message}`;

		fragment.appendChild(this.getToastNameElement(logLevel));
		fragment.appendChild(messageElement);

		// Display the toast
		new Notice(fragment, duration);
	}

	// Trace log function
	trace(message: any | any[], showToast: boolean = false, duration?: number) {
		this.log(LogLevel.Trace, 'trace', message, showToast, duration);
	}

	// Debug log function
	debug(message: any | any[], showToast: boolean = false, duration?: number) {
		this.log(LogLevel.Debug, 'debug', message, showToast, duration);
	}

	// Info log function
	info(message: any | any[], showToast: boolean = false, duration?: number) {
		this.log(LogLevel.Info, 'info', message, showToast, duration);
	}

	// Warning log function
	warn(methodName: string, error: unknown) {
		this.log(LogLevel.Warn, 'warn', '', false, undefined, methodName, error);
	}

	// Error log function
	error(methodName: string, error: unknown) {
		this.log(LogLevel.Error, 'error', '', false, undefined, methodName, error);
	}

	private log(
		level: LogLevel, method: 'trace' | 'debug' | 'info' | 'warn' | 'error',
		message: any | any[],
		showToast: boolean,
		duration?: number,
		methodName?: string,
		error?: unknown
	) {
		// if (DooMWhitePlugins.logLevel > level) return;

		const style = this.getStyles(level);
		const pluginName = `[${this.name}]`;

		// Log the message to the console
		switch (method) {
			case 'trace': {
				if (!Array.isArray(message)) {
					console.trace(`%c${pluginName}`, style, message);
				} else {
					console.trace(`%c${pluginName}`, style, message[0], ...message.slice(1));
				}
				break;
			}
			case 'debug': {
				if (!Array.isArray(message)) {
					console.debug(`%c${pluginName}`, style, message);
				} else {
					console.debug(`%c${pluginName}`, style, message[0], ...message.slice(1));
				}
				break;
			}
			case 'info': {
				if (!Array.isArray(message)) {
					console.info(`%c${pluginName}`, style, message);
				} else {
					console.info(`%c${pluginName}`, style, message[0], ...message.slice(1));
				}
				break;
			}
			case 'warn': {
				const errorMessage = this.getErrorMessage(error, methodName || '');
				console.warn(`%c${pluginName}`, style, errorMessage);
				this.toast(level, errorMessage, 5000);
				return;
			}
			case 'error': {
				const errorMessage = this.getErrorMessage(error, methodName || '');
				console.error(`%c${pluginName}`, style, errorMessage);
				this.toast(level, errorMessage, 0);
				return;
			}
			default:
				throw new NotImplementedError(nameof(method))
		}

		// Show a toast if required
		if (showToast) {
			this.toast(level, Array.isArray(message) ? message.join(' ') : `${message}`, duration);
		}
	}
}
