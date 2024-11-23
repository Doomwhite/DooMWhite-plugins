import { Plugin } from 'obsidian';
import DailyNotesPlugin from 'plugins/daily-notes/daily-notes';
import DailyNotesPluginSettings from 'plugins/daily-notes/settings.ts';
import FolderNotesPlugin from 'plugins/folder-notes/folder-notes';
import FolderNotesPluginSettings from 'plugins/folder-notes/settings.ts';
import LocalImageServerPlugin from 'plugins/local-image-server/local-image-server';
import LocalImageServerPluginSettings from 'plugins/local-image-server/settings.ts';
import RelatedNotesPlugin from 'plugins/related-notes/related-notes';
import RelatedNotesPluginSettings from 'plugins/related-notes/settings';
import MyPluginSettingTab from 'settings/settings-tab';
import BasePluginModule from 'utils/base-plugin-module';
import { DEFAULT_SETTINGS, loadSettings, LogLevel, PluginSettings, saveSettings } from './settings/settings';

export interface PluginModule {
	loaded: boolean;
	load(): void;
	unload(): void;
}

export default class DooMWhitePlugins extends Plugin {
	static logLevel = LogLevel.Warn;

	settings: PluginSettings;

	private dailyNotesPlugin: BasePluginModule<DailyNotesPluginSettings> = new DailyNotesPlugin(this);
	private folderNotesPlugin: BasePluginModule<FolderNotesPluginSettings> = new FolderNotesPlugin(this);
	private relatedNotesPlugin: BasePluginModule<RelatedNotesPluginSettings> = new RelatedNotesPlugin(this);
	private localImageServerPlugin: BasePluginModule<LocalImageServerPluginSettings> = new LocalImageServerPlugin(this);
	private plugins: BasePluginModule<any>[] = [
		this.dailyNotesPlugin,
		this.folderNotesPlugin,
		this.relatedNotesPlugin,
		this.localImageServerPlugin
	];
	private hasSettingsTab: boolean;

	async onload() {
		// Load settings
		this.settings = await loadSettings(this, DEFAULT_SETTINGS);
		DooMWhitePlugins.logLevel = this.settings.logLevel;

		if (this.settings.enableDailyNotesPlugin) {
			this.dailyNotesPlugin.load(this.settings.dailyNotesPluginSettings);
		}

		if (this.settings.enableFolderNotesPlugin) {
			this.folderNotesPlugin.load(this.settings.folderNotesPluginSettings);
		}

		if (this.settings.enableRelatedNotesPlugin) {
			this.relatedNotesPlugin.load(this.settings.relatedNotesPluginSettings);
		}

		if (this.settings.enableLocalImageServerPlugin) {
			this.localImageServerPlugin.load(this.settings.localImageServerPluginSettings);
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
			this.dailyNotesPlugin.load(this.settings.dailyNotesPluginSettings);
		} else {
			this.dailyNotesPlugin.unload();
		}
	}

	async toggleErrorWrapingDailyNotesPlugin(enable: boolean) {
		this.settings.dailyNotesPluginSettings.enableErrorWrapping = enable;
		await this.saveSettings();
		this.dailyNotesPlugin.unload();
		this.dailyNotesPlugin.load(this.settings.dailyNotesPluginSettings);
	}

	async toggleEnableFolderNotesPlugin(enable: boolean) {
		this.settings.enableFolderNotesPlugin = enable;
		await this.saveSettings();
		if (enable) {
			this.folderNotesPlugin.load(this.settings.folderNotesPluginSettings);
		} else {
			this.folderNotesPlugin.unload();
		}
	}

	async toggleErrorWrapingFolderNotesPlugin(enable: boolean) {
		this.settings.folderNotesPluginSettings.enableErrorWrapping = enable;
		await this.saveSettings();
		this.folderNotesPlugin.unload();
		this.folderNotesPlugin.load(this.settings.folderNotesPluginSettings);
	}

	async toggleEnableRelatedNotesPlugin(enable: boolean) {
		this.settings.enableRelatedNotesPlugin = enable;
		await this.saveSettings();
		if (enable) {
			this.relatedNotesPlugin.load(this.settings.relatedNotesPluginSettings);
		} else {
			this.relatedNotesPlugin.unload();
		}
	}

	async toggleErrorWrapingRelatedNotesPlugin(enable: boolean) {
		this.settings.relatedNotesPluginSettings.enableErrorWrapping = enable;
		await this.saveSettings();
		this.relatedNotesPlugin.unload();
		this.relatedNotesPlugin.load(this.settings.relatedNotesPluginSettings);
	}

	async toggleEnableLocalImageServerPlugin(enable: boolean) {
		this.settings.enableLocalImageServerPlugin = enable;
		await this.saveSettings();
		if (enable) {
			this.localImageServerPlugin.load(this.settings.localImageServerPluginSettings);
		} else {
			this.localImageServerPlugin.unload();
		}
	}

	async toggleErrorWrapingLocalImageServerPlugin(enable: boolean) {
		this.settings.localImageServerPluginSettings.enableErrorWrapping = enable;
		await this.saveSettings();
		this.localImageServerPlugin.unload();
		this.localImageServerPlugin.load(this.settings.localImageServerPluginSettings);
	}
}
