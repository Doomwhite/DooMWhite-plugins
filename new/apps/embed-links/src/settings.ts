import { ErrorWrappingSettings } from 'utils/base-plugin-module';

export class EmbedLinksPluginSettings implements ErrorWrappingSettings {
    static readonly DEFAULT_ENABLE_ERROR_WRAPPING: boolean = false;
    static readonly DEFAULT_POPUP: boolean = true;
    static readonly DEFAULT_RM_DISMISS: boolean = false;
    static readonly DEFAULT_AUTO_EMBED_WHEN_EMPTY: boolean = false;
    static readonly DEFAULT_PRIMARY: string = 'microlink';
    static readonly DEFAULT_BACKUP: string = 'jsonlink';
    static readonly DEFAULT_DEBUG: boolean = false;
    static readonly DEFAULT_IN_PLACE: boolean = false;
    static readonly DEFAULT_DELAY: number = 0;

	popup: boolean = EmbedLinksPluginSettings.DEFAULT_POPUP;
	rmDismiss: boolean = EmbedLinksPluginSettings.DEFAULT_RM_DISMISS;
	autoEmbedWhenEmpty: boolean = EmbedLinksPluginSettings.DEFAULT_AUTO_EMBED_WHEN_EMPTY;
	primary: string = EmbedLinksPluginSettings.DEFAULT_PRIMARY;
	backup: string = EmbedLinksPluginSettings.DEFAULT_BACKUP;
	inPlace: boolean = EmbedLinksPluginSettings.DEFAULT_IN_PLACE;
	debug: boolean = EmbedLinksPluginSettings.DEFAULT_DEBUG;
	delay: number = EmbedLinksPluginSettings.DEFAULT_DELAY;
    enableErrorWrapping: boolean = EmbedLinksPluginSettings.DEFAULT_ENABLE_ERROR_WRAPPING;
}
