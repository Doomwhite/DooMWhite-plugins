import { App, PluginSettingTab } from 'obsidian';
import DailyNotesPlugin from './main';

export default class DailyNotesSettingsTab extends PluginSettingTab {
	readonly plugin: DailyNotesPlugin;

	constructor(app: App, plugin: DailyNotesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		this.plugin.utils.createLogElements(containerEl);
	}
}
