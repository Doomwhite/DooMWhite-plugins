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
import { DEFAULT_SETTINGS, loadSettings, PluginSettings, saveSettings } from './settings/settings';

export interface PluginModule {
	loaded: boolean;
	load(): void;
	unload(): void;
}

export default class DooMWhitePlugins extends Plugin {
	settings: PluginSettings;

	private dailyNotesPlugin: BasePluginModule<DailyNotesPluginSettings> = new DailyNotesPlugin(this);
	private folderNotesPlugin: BasePluginModule<FolderNotesPluginSettings> = new FolderNotesPlugin(this);
	private relatedNotesPlugin: BasePluginModule<RelatedNotesPluginSettings> = new RelatedNotesPlugin(this);
	private localImageServerPlugin: BasePluginModule<LocalImageServerPluginSettings> = new LocalImageServerPlugin(this);
	private plugins: BasePluginModule<unknown>[] = [
		this.dailyNotesPlugin,
		this.folderNotesPlugin,
		this.relatedNotesPlugin,
		this.localImageServerPlugin
	];
	private hasSettingsTab: boolean;

	async onload() {
		// Load settings
		this.settings = await loadSettings(this, DEFAULT_SETTINGS);
		console.log('this.settings', this.settings);

		if (this.settings.enableDailyNotesPlugin) {
			this.dailyNotesPlugin.load(this.settings.dailyNotesPluginSettings);
		}

		if (this.settings.enableFolderNotesPlugin) {
			this.folderNotesPlugin.load(this.settings.folderNotesPlugin);
		}

		if (this.settings.enableRelatedNotesPlugin) {
			this.relatedNotesPlugin.load(this.settings.relatedNotesPlugin);
		}

		if (this.settings.enableLocalImageServerPlugin) {
			this.localImageServerPlugin.load(this.settings.localImageServerPlugin);
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

	async toggleEnableFolderNotesPlugin(enable: boolean) {
		this.settings.enableFolderNotesPlugin = enable;
		await this.saveSettings();
		if (enable) {
			this.folderNotesPlugin.load(this.settings.folderNotesPlugin);
		} else {
			this.folderNotesPlugin.unload();
		}
	}

	async toggleEnableRelatedNotesPlugin(enable: boolean) {
		this.settings.enableRelatedNotesPlugin = enable;
		await this.saveSettings();
		if (enable) {
			this.relatedNotesPlugin.load(this.settings.relatedNotesPlugin);
		} else {
			this.relatedNotesPlugin.unload();
		}
	}

	async toggleEnableLocalImageServerPlugin(enable: boolean) {
		this.settings.enableLocalImageServerPlugin = enable;
		await this.saveSettings();
		if (enable) {
			this.localImageServerPlugin.load(this.settings.localImageServerPlugin);
		} else {
			this.localImageServerPlugin.unload();
		}
	}
}
