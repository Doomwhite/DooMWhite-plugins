import { ErrorWrappingSettings } from 'utils/base-plugin-module';

export default class DailyNotesPluginSettings implements ErrorWrappingSettings {
	static readonly DEFAULT_ENABLE_ERROR_WRAPPING: boolean = false;

	enableErrorWrapping: boolean = DailyNotesPluginSettings.DEFAULT_ENABLE_ERROR_WRAPPING;
}
