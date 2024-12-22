import { App, PluginSettingTab } from 'obsidian';
import PluginA from './main';

export default class PluginASettingsTab extends PluginSettingTab {
	readonly plugin: PluginA;

	constructor(app: App, plugin: PluginA) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		this.plugin.utils.createLogElements(containerEl);
	}
}
