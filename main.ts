import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, loadSettings, MyPluginSettings as PluginSettings, saveSettings } from './settings';
import { DailyNotesPlugin } from './utils/daily-notes';
import { FolderNotesPlugin } from './utils/folder-notes';
import { MyPluginSettingTab } from 'settings-tab';
import { RelatedNotesPlugin } from 'utils/related-notes';
import { BasePluginModule } from 'utils/base-plugin-module';

export interface PluginModule {
	loaded: boolean;
	load(): void;
	unload(): void;
}

export default class DooMWhitePlugins extends Plugin {

	settings: PluginSettings;

	private dailyNotesPlugin: BasePluginModule = new DailyNotesPlugin(this);
	private folderNotesPlugin: BasePluginModule = new FolderNotesPlugin(this);
	private relatedNotesPlugin: BasePluginModule = new RelatedNotesPlugin(this);
	private plugins: BasePluginModule[] = [
		this.dailyNotesPlugin,
		this.folderNotesPlugin,
		this.relatedNotesPlugin
	]
	private hasSettingsTab: boolean;

	async onload() {
		// Load settings
		this.settings = await loadSettings(this, DEFAULT_SETTINGS);

		if (this.settings.enableDailyNotesPlugin) {
			this.dailyNotesPlugin.load();
		}

		if (this.settings.enableFolderNotesPlugin) {
			this.folderNotesPlugin.load();
		}

		if (this.settings.enableRelatedNotesPlugin) {
			this.relatedNotesPlugin.load();
		}

		this.addSettings();
	}

	private addSettings() {
		if (this.hasSettingsTab) return;
		this.hasSettingsTab = true;
		this.addSettingTab(new MyPluginSettingTab(this.app, this));
	}

	onunload() {
		// Perform any necessary cleanup
		for (const plugin of this.plugins) {
			plugin.unload();
		}
	}

	async saveSettings() {
		await saveSettings(this);
	}

	async toggleEnableDailyNotesPlugin(enable: boolean) {
		this.settings.enableDailyNotesPlugin = enable;
		await this.saveSettings();
		if (enable) {
			this.dailyNotesPlugin.load();
		} else {
			this.dailyNotesPlugin.unload();
		}
	}

	async toggleEnableFolderNotesPlugin(enable: boolean) {
		this.settings.enableFolderNotesPlugin = enable;
		await this.saveSettings();
		if (enable) {
			this.folderNotesPlugin.load();
		} else {
			this.folderNotesPlugin.unload();
		}
	}

	async toggleEnableRelatedNotesPlugin(enable: boolean) {
		this.settings.enableRelatedNotesPlugin = enable;
		await this.saveSettings();
		if (enable) {
			this.relatedNotesPlugin.load();
		} else {
			this.relatedNotesPlugin.unload();
		}
	}
}
