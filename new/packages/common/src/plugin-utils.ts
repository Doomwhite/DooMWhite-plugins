import { FileSystemAdapter, Plugin, Setting } from 'obsidian';
import { Logger, LoggingFunctions, LogLevel } from './logging-functions';
import { InvalidTypeException } from './exceptions';
import { restorePrototypes } from './restore-prototypes';

export interface Logging {
	logLevel: LogLevel;
	toastLogLevel: LogLevel;
}

export class PluginUtils<T extends Logging> implements Logger {
	protected readonly plugin: Plugin;
	protected readonly defaultSettings: T;
	protected loggingFunctions!: LoggingFunctions;

	settings!: T;

	private constructor(plugin: Plugin, defaultSettings: T) {
		this.plugin = plugin;
		this.defaultSettings = defaultSettings;
	}

	static async create<T extends Logging>(
		plugin: Plugin,
		defaultSettings: T,
	): Promise<PluginUtils<T>> {
		const instance = new PluginUtils(plugin, defaultSettings);
		instance.settings = await instance.loadSettings();
		instance.loggingFunctions = new LoggingFunctions(
			plugin.manifest.name,
			instance.settings.logLevel,
			instance.settings.toastLogLevel,
		);
		return instance;
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

	async loadSettings<T>(): Promise<T> {
		const rawData = await this.plugin.loadData();
		if (!(typeof rawData === 'object' || typeof rawData === 'undefined'))
			throw new InvalidTypeException(rawData);

		return restorePrototypes(rawData, this.defaultSettings);
	}

	async saveSettings(): Promise<void> {
		await this.plugin.saveData(this.settings);
	}

	updateLogLevel(logLevel: LogLevel): void {
		this.settings.logLevel = logLevel;
		this.loggingFunctions.updateLogLevel(logLevel);
	}

	updateToastLogLevel(logLevel: LogLevel): void {
		this.settings.toastLogLevel = logLevel;
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

	createLogElements(containerEl: HTMLElement): void {
		containerEl.createEl('h2', { text: this.plugin.manifest.name });

		new Setting(containerEl)
			.setName('Log level')
			.setDesc('Sets the log level')
			.addDropdown((dropdown) => {
				dropdown
					.addOptions({
						[LogLevel.None]: 'None',
						[LogLevel.Trace]: 'Trace',
						[LogLevel.Debug]: 'Debug',
						[LogLevel.Info]: 'Log',
						[LogLevel.Warn]: 'Warning',
						[LogLevel.Error]: 'Error',
					})
					.setValue(this.settings.logLevel.toString()) // Set initial value from static logLevel
					.onChange(async (value) => {
						const level = parseInt(value, 10);
						if (!isNaN(level) && level in LogLevel) {
							this.updateLogLevel(level as LogLevel);
							await this.saveSettings();
						} else {
							console.error(
								`Invalid log level selected: ${value}`,
							);
						}
					});
			});

		new Setting(containerEl)
			.setName('Toast log level')
			.setDesc('Sets the toast log level')
			.addDropdown((dropdown) => {
				dropdown
					.addOptions({
						[LogLevel.None]: 'None',
						[LogLevel.Trace]: 'Trace',
						[LogLevel.Debug]: 'Debug',
						[LogLevel.Info]: 'Log',
						[LogLevel.Warn]: 'Warning',
						[LogLevel.Error]: 'Error',
					})
					.setValue(this.settings.toastLogLevel.toString()) // Set initial value from static logLevel
					.onChange(async (value) => {
						const level = parseInt(value, 10);
						if (!isNaN(level) && level in LogLevel) {
							this.updateToastLogLevel(level as LogLevel);
							await this.saveSettings();
						} else {
							console.error(
								`Invalid log level selected: ${value}`,
							);
						}
					});
			});
	}
}
