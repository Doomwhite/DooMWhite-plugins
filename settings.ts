import DooMWhitePlugins from 'main';

export interface MyPluginSettings {
	mySetting: string;
	enableDailyNotesPlugin: boolean;
	enableFolderNotesPlugin: boolean;
	enableRelatedNotesPlugin: boolean;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	enableDailyNotesPlugin: true,
	enableFolderNotesPlugin: true,
	enableRelatedNotesPlugin: true
}

export async function loadSettings(plugin: DooMWhitePlugins, defaultSettings: MyPluginSettings): Promise<MyPluginSettings> {
	return Object.assign({}, defaultSettings, await plugin.loadData());
}

export async function saveSettings(plugin: DooMWhitePlugins) {
	await plugin.saveData(plugin.settings);
}
