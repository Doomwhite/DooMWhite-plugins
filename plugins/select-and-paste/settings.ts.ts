import { ErrorWrappingSettings } from 'utils/base-plugin-module';

export default class SelectAndPastePluginSettings implements ErrorWrappingSettings {
	static readonly DEFAULT_ENABLE_ERROR_WRAPPING: boolean = false;

	enableErrorWrapping: boolean = SelectAndPastePluginSettings.DEFAULT_ENABLE_ERROR_WRAPPING;
}
