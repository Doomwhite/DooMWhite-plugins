import { FileSystemAdapter, Plugin } from 'obsidian';
import { Logger, LoggingFunctions, LogLevel } from './logging-functions';

export interface Logging {
	logLevel: LogLevel;
	toastLogLevel: LogLevel;
}

export class PluginUtils<T extends Logging> implements Logger {
	private readonly plugin: Plugin;
	// private readonly settings: T;
	private readonly loggingFunctions: LoggingFunctions;

	constructor(plugin: Plugin, settings: T) {
		this.plugin = plugin;
		// this.settings = settings;

		this.loggingFunctions = new LoggingFunctions(
			plugin.manifest.name,
			settings.logLevel,
			settings.toastLogLevel,
		);
	}

	getVaultPath(): string {
		try {
			const adapter = this.plugin.app.vault.adapter;
			if (adapter instanceof FileSystemAdapter) {
				return adapter.getBasePath();
			}
			return '';
		} catch (error) {
			this.error(LogLevel.Error, 'getVaultPath', error);
			return '';
		}
	}

	updateLogLevel(logLevel: LogLevel): void {
		this.loggingFunctions.updateLogLevel(logLevel);
	}

	updateToastLogLevel(logLevel: LogLevel): void {
		this.loggingFunctions.updateToastLogLevel(logLevel);
	}

	toast(toastLogLevel: LogLevel, ...messages: unknown[]): void {
		this.loggingFunctions.toast(toastLogLevel, ...messages);
	}

	trace(toastLogLevel: LogLevel, ...messages: unknown[]): void {
		this.loggingFunctions.trace(toastLogLevel, ...messages);
	}

	info(toastLogLevel: LogLevel, ...messages: unknown[]): void {
		this.loggingFunctions.info(toastLogLevel, ...messages);
	}

	debug(toastLogLevel: LogLevel, ...messages: unknown[]): void {
		this.loggingFunctions.debug(toastLogLevel, ...messages);
	}

	warn(toastLogLevel: LogLevel, ...messages: unknown[]): void {
		this.loggingFunctions.warn(toastLogLevel, ...messages);
	}

	error(toastLogLevel: LogLevel, ...messages: unknown[]): void {
		this.loggingFunctions.error(toastLogLevel, ...messages);
	}
}
