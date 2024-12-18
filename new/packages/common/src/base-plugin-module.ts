import { FileSystemAdapter, Plugin } from 'obsidian';
import { LoggingFunctions } from './logging-functions';

export enum LogLevel {
	None,
	Trace,
	Debug,
	Info,
	Warn,
	Error,
}

export interface Logging {
	logLevel: LogLevel;
	toastLogLevel: LogLevel;
}

export default abstract class BasePluginModule<
	T extends Logging,
> extends LoggingFunctions {
	readonly plugin: Plugin;

	settings!: T;

	protected constructor(name: string, settings: T, plugin: Plugin) {
		super(name, settings.logLevel, settings.toastLogLevel);
		this.plugin = plugin;
	}

	abstract onLoad(): void;
	abstract onUnload(): void;

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
}
