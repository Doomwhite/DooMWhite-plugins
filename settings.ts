import DooMWhitePlugins from 'main';

export interface PluginSettings {
	mySetting: string;
	enableDailyNotesPlugin: boolean;
	enableFolderNotesPlugin: boolean;
	enableRelatedNotesPlugin: boolean;
	enableLocalImageServerPlugin: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
	mySetting: 'default',
	enableDailyNotesPlugin: true,
	enableFolderNotesPlugin: true,
	enableRelatedNotesPlugin: true,
	enableLocalImageServerPlugin: true
}

export async function loadSettings(plugin: DooMWhitePlugins, defaultSettings: PluginSettings): Promise<PluginSettings> {
	return Object.assign({}, defaultSettings, await plugin.loadData());
}

export async function saveSettings(plugin: DooMWhitePlugins) {
	await plugin.saveData(plugin.settings);
}
