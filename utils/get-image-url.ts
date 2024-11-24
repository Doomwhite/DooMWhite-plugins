import { normalizePath } from 'obsidian';
import { join } from 'path';
import BasePluginModule, { ErrorWrappingSettings } from './base-plugin-module';

export class ImageExtractor<T extends ErrorWrappingSettings> {
    readonly plugin: BasePluginModule<T>;

    constructor(plugin: BasePluginModule<T>) {
        this.plugin = plugin;
    }

    getObisidianImageUrl(imageName: string): string {
        const imagePath = join('attachments', imageName)
        this.plugin.debug(`imagePath: ${imagePath}`)

        const normalizedImagePath = normalizePath(imagePath)
        this.plugin.debug(`normalizedImagePath: ${normalizedImagePath}`)

        const vaultImagePath = this.plugin.plugin.app.vault.adapter.getResourcePath(normalizedImagePath)
        this.plugin.debug(`vaultImagePath: ${vaultImagePath}`)

        return vaultImagePath;
    }
}
