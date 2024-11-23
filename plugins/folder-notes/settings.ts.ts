import { ErrorWrappingSettings } from 'utils/base-plugin-module';

export default class FolderNotesPluginSettings implements ErrorWrappingSettings {
    static readonly DEFAULT_ENABLE_ERROR_WRAPPING: boolean = false;

    enableErrorWrapping: boolean = FolderNotesPluginSettings.DEFAULT_ENABLE_ERROR_WRAPPING;
}
