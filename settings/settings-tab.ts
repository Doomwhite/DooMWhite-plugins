import DooMWhitePlugins from 'main';
import { App, PluginSettingTab, Setting } from 'obsidian';
import LocalImageServerPluginSettings from '../plugins/local-image-server/settings.ts';

export default class MyPluginSettingTab extends PluginSettingTab {
	plugin: DooMWhitePlugins;

	constructor(app: App, plugin: DooMWhitePlugins) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Daily Notes")
			.setDesc("Enable/disable the 'Create daily note in folder' functionality.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableDailyNotesPlugin)
					.onChange(async (value) => {
						for (const settings of dailyNotesSettings) {
							settings.setDisabled(!value);
						}
						await this.plugin.toggleEnableDailyNotesPlugin(value);
					})
			);

		const dailyNotesSettings = [
			new Setting(containerEl)
				.setName("Daily Notes - Enable error logging")
				.setDesc("Enable/disable the error logging.")
				.addToggle((toggle) =>
					toggle.setValue(this.plugin.settings.dailyNotesPluginSettings.enableErrorWrapping)
						.onChange(async (value) => {
							await this.plugin.toggleErrorWrapingDailyNotesPlugin(value);
						})
				)
		];

		new Setting(containerEl)
			.setName("Folder Notes")
			.setDesc("Enable/disable the 'Create waypoint node' functionality.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableFolderNotesPlugin)
					.onChange(async (value) => {
						for (const settings of folderNotesSettings) {
							settings.setDisabled(!value);
						}
						await this.plugin.toggleEnableFolderNotesPlugin(value);
					})
			);

		const folderNotesSettings = [
			new Setting(containerEl)
				.setName("Folder Notes - Enable error logging")
				.setDesc("Enable/disable the error logging.")
				.addToggle((toggle) =>
					toggle.setValue(this.plugin.settings.folderNotesPluginSettings.enableErrorWrapping)
						.onChange(async (value) => {
							await this.plugin.toggleErrorWrapingFolderNotesPlugin(value);
						})
				)
		];

		new Setting(containerEl)
			.setName("Related Notes")
			.setDesc("Enable/disable the 'Add related notes' functionality.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableRelatedNotesPlugin)
					.onChange(async (value) => {
						for (const settings of relatedNotesSettins) {
							settings.setDisabled(!value);
						}
						await this.plugin.toggleEnableRelatedNotesPlugin(value);
					})
			);

		const relatedNotesSettins = [
			new Setting(containerEl)
				.setName("Related Notes - Enable error logging")
				.setDesc("Enable/disable the error logging.")
				.addToggle((toggle) =>
					toggle.setValue(this.plugin.settings.relatedNotesPluginSettings.enableErrorWrapping)
						.onChange(async (value) => {
							await this.plugin.toggleErrorWrapingRelatedNotesPlugin(value);
						})
				)
		];

		new Setting(containerEl)
			.setName("Local Image Server")
			.setDesc("Enable the local image server to serve images from the attachments folder.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableLocalImageServerPlugin)
				.onChange(async (value) => {
					for (const settings of localImageServerSettings) {
						settings.setDisabled(!value);
					}
					await this.plugin.toggleEnableLocalImageServerPlugin(value);
				})
			);


		const localImageServerSettings = [
			new Setting(containerEl)
				.setName("Local Image Server - Enable error logging")
				.setDesc("Enable/disable the error logging.")
				.addToggle((toggle) =>
					toggle.setValue(this.plugin.settings.localImageServerPluginSettings.enableErrorWrapping)
						.onChange(async (value) => {
							await this.plugin.toggleErrorWrapingLocalImageServerPlugin(value);
						})
				),
			new Setting(containerEl)
				.setName("Local Image Server - Path")
				.setDesc(`Path. Default: ${LocalImageServerPluginSettings.DEFAULT_PATH}`)
				.addText(toggle => toggle
					.setValue(this.plugin.settings.localImageServerPluginSettings.path)
					.onChange(async (value) => {
						this.plugin.settings.localImageServerPluginSettings.path = value;
						await this.plugin.saveSettings();
					})
				),
			new Setting(containerEl)
				.setName("Local Image Server - Port")
				.setDesc(`Port. Default: ${LocalImageServerPluginSettings.DEFAULT_PORT}`)
				.addText(toggle => toggle
					.setValue(this.plugin.settings.localImageServerPluginSettings.port)
					.onChange(async (value) => {
						this.plugin.settings.localImageServerPluginSettings.port = value;
						await this.plugin.saveSettings();
					})
				),
			new Setting(containerEl)
				.setName("Local Image Server - Use CORS")
				.setDesc(`Use CORS. Default: ${LocalImageServerPluginSettings.DEFAULT_USE_CORS}`)
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.localImageServerPluginSettings.useCors)
					.onChange(async (value) => {
						this.plugin.settings.localImageServerPluginSettings.useCors = value;
						await this.plugin.saveSettings();
					})
				),
			new Setting(containerEl)
				.setName("Local Image Server - Use HTTPS")
				.setDesc(`Use Https. Default: ${LocalImageServerPluginSettings.DEFAULT_USE_HTTPS}`)
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.localImageServerPluginSettings.useHttps)
					.onChange(async (value) => {
						this.plugin.settings.localImageServerPluginSettings.useHttps = value;
						await this.plugin.saveSettings();
					})
				),
		]

	}
}
