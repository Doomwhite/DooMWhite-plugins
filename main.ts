import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, loadSettings, PluginSettings, saveSettings } from './settings';
import { DailyNotesPlugin } from './utils/daily-notes';
import { FolderNotesPlugin } from './utils/folder-notes';
import { MyPluginSettingTab } from 'settings-tab';
import { RelatedNotesPlugin } from 'utils/related-notes';
import { BasePluginModule } from 'utils/base-plugin-module';
import { LocalImageServerPlugin } from './utils/local-image-server'; // Import the new plugin module

export interface PluginModule {
	loaded: boolean;
	load(): void;
	unload(): void;
}

export default class DooMWhitePlugins extends Plugin {
	settings: PluginSettings;

	private dailyNotesPlugin: BasePluginModule<PluginSettings> = new DailyNotesPlugin(this);
	private folderNotesPlugin: BasePluginModule<PluginSettings> = new FolderNotesPlugin(this);
	private relatedNotesPlugin: BasePluginModule<PluginSettings> = new RelatedNotesPlugin(this);
	private localImageServerPlugin: BasePluginModule<PluginSettings> = new LocalImageServerPlugin(this);
	private plugins: BasePluginModule<unknown>[] = [
		this.dailyNotesPlugin,
		this.folderNotesPlugin,
		this.relatedNotesPlugin,
		this.localImageServerPlugin // Add the local image server plugin to the list
	];
	private hasSettingsTab: boolean;

	async onload() {
		// Load settings
		this.settings = await loadSettings(this, DEFAULT_SETTINGS);

		if (this.settings.enableDailyNotesPlugin) {
			this.dailyNotesPlugin.load(this.settings);
		}

		if (this.settings.enableFolderNotesPlugin) {
			this.folderNotesPlugin.load(this.settings);
		}

		if (this.settings.enableRelatedNotesPlugin) {
			this.relatedNotesPlugin.load(this.settings);
		}

		if (this.settings.enableLocalImageServerPlugin) {
			this.localImageServerPlugin.load(this.settings);
		}

		this.addSettings();
	}

	private addSettings() {
		if (this.hasSettingsTab) return;
		this.hasSettingsTab = true;
		this.addSettingTab(new MyPluginSettingTab(this.app, this));
	}

	unload() {
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
			this.dailyNotesPlugin.load(this.settings);
		} else {
			this.dailyNotesPlugin.unload();
		}
	}

	async toggleEnableFolderNotesPlugin(enable: boolean) {
		this.settings.enableFolderNotesPlugin = enable;
		await this.saveSettings();
		if (enable) {
			this.folderNotesPlugin.load(this.settings);
		} else {
			this.folderNotesPlugin.unload();
		}
	}

	async toggleEnableRelatedNotesPlugin(enable: boolean) {
		this.settings.enableRelatedNotesPlugin = enable;
		await this.saveSettings();
		if (enable) {
			this.relatedNotesPlugin.load(this.settings);
		} else {
			this.relatedNotesPlugin.unload();
		}
	}

	async toggleEnableLocalImageServerPlugin(enable: boolean) {
		this.settings.enableLocalImageServerPlugin = enable;
		await this.saveSettings();
		if (enable) {
			this.localImageServerPlugin.load(this.settings); // Load the server plugin
		} else {
			this.localImageServerPlugin.unload(); // Unload the server plugin
		}
	}
}