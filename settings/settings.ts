import DooMWhitePlugins from 'main';
import DailyNotesPluginSettings from '../plugins/daily-notes/settings.ts';
import FolderNotesPluginSettings from '../plugins/folder-notes/settings.ts';
import LocalImageServerPluginSettings from '../plugins/local-image-server/settings.ts';
import RelatedNotesPluginSettings from '../plugins/related-notes/settings';

export interface PluginSettings {
	mySetting: string;
	enableDailyNotesPlugin: boolean;
	enableFolderNotesPlugin: boolean;
	enableRelatedNotesPlugin: boolean;
	enableLocalImageServerPlugin: boolean;
	dailyNotesPluginSettings: DailyNotesPluginSettings;
	folderNotesPluginSettings: FolderNotesPluginSettings;
	relatedNotesPluginSettings: RelatedNotesPluginSettings;
	localImageServerPluginSettings: LocalImageServerPluginSettings;
}

export const DEFAULT_SETTINGS: PluginSettings = {
	mySetting: 'default',
	enableDailyNotesPlugin: true,
	enableFolderNotesPlugin: true,
	enableRelatedNotesPlugin: true,
	enableLocalImageServerPlugin: true,
	dailyNotesPluginSettings: new DailyNotesPluginSettings(),
	folderNotesPluginSettings: new FolderNotesPluginSettings(),
	relatedNotesPluginSettings: new RelatedNotesPluginSettings(),
	localImageServerPluginSettings: new LocalImageServerPluginSettings()
}

function restorePrototypes<T>(target: T | null | undefined, defaultInstance: T): T {
	// If the target is null or undefined, fallback to a cloned defaultInstance
	if (target == null) {
		return defaultInstance; // You can use a deep clone utility if needed.
	}

	// Iterate through the keys of the default instance
	return Object.keys(defaultInstance).reduce((result, key) => {
		const defaultValue = (defaultInstance as any)[key];
		const rawValue = (target as any)[key];

		// Check if the default value is an object and not an array
		if (defaultValue instanceof Object && !(defaultValue instanceof Array)) {
			(result as any)[key] = restorePrototypes(rawValue, defaultValue); // Recursively restore prototypes
		} else {
			(result as any)[key] = rawValue !== undefined ? rawValue : defaultValue; // Use rawValue or defaultValue
		}

		return result;
	}, Object.create(Object.getPrototypeOf(defaultInstance))); // Preserve prototype of defaultInstance
}

export async function loadSettings(
	plugin: DooMWhitePlugins,
	defaultSettings: PluginSettings
): Promise<PluginSettings> {
	const rawData = await plugin.loadData();
	return restorePrototypes(rawData, defaultSettings);
}

export async function saveSettings(plugin: DooMWhitePlugins) {
	await plugin.saveData(plugin.settings);
}
