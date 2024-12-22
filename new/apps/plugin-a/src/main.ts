import { isBlank, LogLevel, PluginUtils } from 'common';
import { Logging } from 'common';
import { Plugin } from 'obsidian';
import PluginASettingsTab from './settings-tab';

console.log('Entrou no app', isBlank);

export class Settings implements Logging {
	logLevel: LogLevel = LogLevel.Trace;
	toastLogLevel: LogLevel = LogLevel.Trace;
}

export default class PluginA extends Plugin {
	utils!: PluginUtils<Settings>;

	async onload() {
		console.log('Carregou o PluginA', isBlank(false));
		this.utils = await PluginUtils.create<Settings>(this, new Settings());
		this.addSettingTab(new PluginASettingsTab(this.app, this));
		this.utils.trace(LogLevel.Trace, 'hahahah');
		this.utils.debug(LogLevel.Debug, 'hahahah');
		this.utils.error(LogLevel.Error, 'hahahah');
		this.utils.info(LogLevel.Info, 'hahahah');
		this.utils.warn(LogLevel.Warn, 'hahahah');
	}

	unload() {
		console.log('Descarregou o PluginA', isBlank(true));
	}
}
