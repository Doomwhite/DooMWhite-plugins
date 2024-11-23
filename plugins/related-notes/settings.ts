import { ErrorWrappingSettings } from 'utils/base-plugin-module';

export default class RelatedNotesPluginSettings implements ErrorWrappingSettings {
	static readonly DEFAULT_ENABLE_ERROR_WRAPPING: boolean = false;

    enableErrorWrapping: boolean = RelatedNotesPluginSettings.DEFAULT_ENABLE_ERROR_WRAPPING;
}
