import DooMWhitePlugins from 'main';
import { App, PluginSettingTab, Setting } from 'obsidian';

export class MyPluginSettingTab extends PluginSettingTab {
	plugin: DooMWhitePlugins;

	constructor(app: App, plugin: DooMWhitePlugins) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// Toggle for Module A
		new Setting(containerEl)
			.setName("Enable Daily Note Module")
			.setDesc("Enable/disable the 'Create daily note in folder' functionality.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableDailyNotesPlugin)
					.onChange(async (value) => {
						await this.plugin.toggleEnableDailyNotesPlugin(value);
					})
			);

		// Toggle for Module B
		new Setting(containerEl)
			.setName("Enable Waypoint Module")
			.setDesc("Enable/disable the 'Create waypoint node' functionality.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableFolderNotesPlugin)
					.onChange(async (value) => {
						await this.plugin.toggleEnableFolderNotesPlugin(value);
					})
			);

		new Setting(containerEl)
			.setName("Enable Related Notes Module")
			.setDesc("Enable/disable the 'Add related notes' functionality.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableRelatedNotesPlugin)
					.onChange(async (value) => {
						await this.plugin.toggleEnableRelatedNotesPlugin(value);
					})
			);

		new Setting(containerEl)
			.setName("Enable Local Image Server")
			.setDesc("Enable the local image server to serve images from the attachments folder.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableLocalImageServerPlugin)
				.onChange(async (value) => {
					await this.plugin.toggleEnableLocalImageServerPlugin(value);
				})
			);
	}
}
