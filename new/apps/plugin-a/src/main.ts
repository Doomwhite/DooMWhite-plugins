import { isBlank, LogLevel, PluginUtils } from 'common';
import { Logging } from 'common';
import { Plugin } from 'obsidian';

console.log('Entrou no app', isBlank);

class Settings implements Logging {
	static readonly DEFAULT_LOG_LEVEL: LogLevel = LogLevel.None;
	static readonly DEFAULT_TOAST_LOG_LEVEL: LogLevel = LogLevel.None;

	logLevel: LogLevel = Settings.DEFAULT_LOG_LEVEL;
	toastLogLevel: LogLevel = Settings.DEFAULT_TOAST_LOG_LEVEL;
}

export default class PluginA extends Plugin {
	utils: PluginUtils<Settings> | null = null;

	onload() {
		console.log('Carregou o PluginA', isBlank(false));
		const settings = new Settings();
		this.utils = new PluginUtils<Settings>(this, settings);
	}

	unload() {
		console.log('Descarregou o PluginA', isBlank(true));
	}
}
