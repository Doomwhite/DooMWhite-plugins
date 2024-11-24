import he from 'he';
import DooMWhitePlugins from 'main';
import Mustache from 'mustache';
import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import { MarkdownTemplate, REGEX } from 'plugins/embed-links/constants.js';
import { parseOptions } from 'plugins/embed-links/parser.js';
import LocalImageServerPluginSettings from '../plugins/local-image-server/settings.ts';
import { LogLevel } from './settings.js';

export default class MyPluginSettingTab extends PluginSettingTab {
	plugin: DooMWhitePlugins;

	constructor(app: App, plugin: DooMWhitePlugins) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'DooMWhite plugins' });

		containerEl.createEl('h3', { text: 'General' });

		new Setting(containerEl)
			.setName("Log level")
			.setDesc("Sets the log level")
			.addDropdown((dropdown) => {
				// Add the options for the dropdown, mapping LogLevel values directly
				dropdown
					.addOptions({
						[LogLevel.Trace]: "Trace",
						[LogLevel.Debug]: "Debug",
						[LogLevel.Info]: "Log",
						[LogLevel.Warn]: "Warning",
						[LogLevel.Error]: "Error",
					})
					.setValue(DooMWhitePlugins.logLevel.toString()) // Set initial value from static logLevel
					.onChange(async (value) => {
						const level = parseInt(value, 10);
						if (!isNaN(level) && level in LogLevel) {
							DooMWhitePlugins.logLevel = level as LogLevel; // Update log level
							this.plugin.settings.logLevel = level;
							await this.plugin.saveSettings();
						} else {
							console.error(`Invalid log level selected: ${value}`);
						}
					});
			});;

		containerEl.createEl('h3', { text: 'Daily Notes' });

		new Setting(containerEl)
			// .setName("Daily Notes")
			// .setDesc("Enable/disable the 'Create daily note in folder' functionality.")
			.setName("Enable")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableDailyNotesPlugin)
					.onChange(async (value) => {
						for (const settings of dailyNotesSettings) {
							settings.setDisabled(!value);
						}
						await this.plugin.toggleEnableDailyNotesPlugin(value);
					})
			);

		const dailyNotesSettings = [
			new Setting(containerEl)
				.setName("Enable error logging")
				.setDesc("Enable/disable the error logging.")
				.addToggle((toggle) =>
					toggle.setValue(this.plugin.settings.dailyNotesPluginSettings.enableErrorWrapping)
						.onChange(async (value) => {
							await this.plugin.toggleErrorWrapingDailyNotesPlugin(value);
						})
				)
		];

		containerEl.createEl('h3', { text: 'Folder Notes' });

		new Setting(containerEl)
			// .setName("Folder Notes")
			// .setDesc("Enable/disable the 'Create waypoint node' functionality.")
			.setName("Enable")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableFolderNotesPlugin)
					.onChange(async (value) => {
						for (const settings of folderNotesSettings) {
							settings.setDisabled(!value);
						}
						await this.plugin.toggleEnableFolderNotesPlugin(value);
					})
			);

		const folderNotesSettings = [
			new Setting(containerEl)
				.setName("Enable error logging")
				.setDesc("Enable/disable the error logging.")
				.addToggle((toggle) =>
					toggle.setValue(this.plugin.settings.folderNotesPluginSettings.enableErrorWrapping)
						.onChange(async (value) => {
							await this.plugin.toggleErrorWrapingFolderNotesPlugin(value);
						})
				)
		];

		containerEl.createEl('h3', { text: 'Related Notes' });

		new Setting(containerEl)
			// .setName("Related Notes")
			// .setDesc("Enable/disable the 'Add related notes' functionality.")
			.setName("Enable")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableRelatedNotesPlugin)
					.onChange(async (value) => {
						for (const settings of relatedNotesSettins) {
							settings.setDisabled(!value);
						}
						await this.plugin.toggleEnableRelatedNotesPlugin(value);
					})
			);

		const relatedNotesSettins = [
			new Setting(containerEl)
				.setName("Enable error logging")
				.setDesc("Enable/disable the error logging.")
				.addToggle((toggle) =>
					toggle.setValue(this.plugin.settings.relatedNotesPluginSettings.enableErrorWrapping)
						.onChange(async (value) => {
							await this.plugin.toggleErrorWrapingRelatedNotesPlugin(value);
						})
				)
		];

		containerEl.createEl('h3', { text: 'Local Image Server' });

		new Setting(containerEl)
			// .setName("Local Image Server")
			// .setDesc("Enable the local image server to serve images from the attachments folder.")
			.setName("Enable")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableLocalImageServerPlugin)
				.onChange(async (value) => {
					for (const settings of localImageServerSettings) {
						settings.setDisabled(!value);
					}
					await this.plugin.toggleEnableLocalImageServerPlugin(value);
				})
			);

		const localImageServerSettings = [
			new Setting(containerEl)
				.setName("Enable error logging")
				.setDesc("Enable/disable the error logging.")
				.addToggle((toggle) =>
					toggle.setValue(this.plugin.settings.localImageServerPluginSettings.enableErrorWrapping)
						.onChange(async (value) => {
							await this.plugin.toggleErrorWrapingLocalImageServerPlugin(value);
						})
				),
			new Setting(containerEl)
				.setName("Path")
				.setDesc(`Path. Default: ${LocalImageServerPluginSettings.DEFAULT_PATH}`)
				.addText(toggle => toggle
					.setValue(this.plugin.settings.localImageServerPluginSettings.path)
					.onChange(async (value) => {
						this.plugin.settings.localImageServerPluginSettings.path = value;
						await this.plugin.saveSettings();
					})
				),
			new Setting(containerEl)
				.setName("Port")
				.setDesc(`Port. Default: ${LocalImageServerPluginSettings.DEFAULT_PORT}`)
				.addText(toggle => toggle
					.setValue(this.plugin.settings.localImageServerPluginSettings.port)
					.onChange(async (value) => {
						this.plugin.settings.localImageServerPluginSettings.port = value;
						await this.plugin.saveSettings();
					})
				),
			new Setting(containerEl)
				.setName("Use CORS")
				.setDesc(`Use CORS. Default: ${LocalImageServerPluginSettings.DEFAULT_USE_CORS}`)
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.localImageServerPluginSettings.useCors)
					.onChange(async (value) => {
						this.plugin.settings.localImageServerPluginSettings.useCors = value;
						await this.plugin.saveSettings();
					})
				),
			new Setting(containerEl)
				.setName("Use HTTPS")
				.setDesc(`Use Https. Default: ${LocalImageServerPluginSettings.DEFAULT_USE_HTTPS}`)
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.localImageServerPluginSettings.useHttps)
					.onChange(async (value) => {
						this.plugin.settings.localImageServerPluginSettings.useHttps = value;
						await this.plugin.saveSettings();
					})
				),
		]

		containerEl.createEl('h3', { text: 'Embed Links' });

		new Setting(containerEl)
			.setName("Enable")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableEmbedLinksPlugin)
				.onChange(async (value) => {
					for (const settings of embedLinksSettings) {
						settings.setDisabled(!value);
					}
					await this.plugin.toggleEnableEmbedLinksPlugin(value);
				})
			)

		const embedLinksSettings = [
			new Setting(containerEl)
				.setName('Popup Menu')
				.setDesc('Auto popup embed menu after pasting url.')
				.addToggle((value) => {
					value.setValue(this.plugin.settings.embedLinksPluginSettings.popup).onChange((value) => {
						this.plugin.settings.embedLinksPluginSettings.popup = value;
						this.plugin.saveSettings();
					});
				}),
			new Setting(containerEl)
				.setName('Remove Dismiss')
				.setDesc(
					'Remove dismiss from popup menu. You can always use ESC to dismiss the popup menu.',
				)
				.addToggle((value) => {
					value
						.setValue(this.plugin.settings.embedLinksPluginSettings.rmDismiss)
						.onChange((value) => {
							this.plugin.settings.embedLinksPluginSettings.rmDismiss = value;
							this.plugin.saveSettings();
						});
				}),
			new Setting(containerEl)
				.setName('Auto Embed')
				.setDesc('Auto embed link when pasting a link into an empty line.')
				.addToggle((value) => {
					value
						.setValue(this.plugin.settings.embedLinksPluginSettings.autoEmbedWhenEmpty)
						.onChange((value) => {
							this.plugin.settings.embedLinksPluginSettings.autoEmbedWhenEmpty = value;
							this.plugin.saveSettings();
						});
				}),
			new Setting(containerEl)
				.setName('Primary Parser')
				.setDesc('Select a primary parser to use for link embeds.')
				.addDropdown((value) => {
					value
						.addOptions(parseOptions)
						.setValue(this.plugin.settings.embedLinksPluginSettings.primary)
						.onChange((value) => {
							this.plugin.settings.embedLinksPluginSettings.primary = value;
							this.plugin.saveSettings();
						});
				}),
			new Setting(containerEl)
				.setName('Secondary Parser')
				.setDesc(
					'Select a secondary parser. It will be used if the primary parser fails.',
				)
				.addDropdown((value) => {
					value
						.addOptions(parseOptions)
						.setValue(this.plugin.settings.embedLinksPluginSettings.backup)
						.onChange((value) => {
							this.plugin.settings.embedLinksPluginSettings.backup = value;
							this.plugin.saveSettings();
						});
				}),
			new Setting(containerEl)
				.setName('In Place')
				.setDesc('Always replace selection with embed.')
				.addToggle((value) => {
					value
						.setValue(this.plugin.settings.embedLinksPluginSettings.inPlace)
						.onChange((value) => {
							this.plugin.settings.embedLinksPluginSettings.inPlace = value;
							this.plugin.saveSettings();
						});
				}),
			new Setting(containerEl)
				.setName('Convert Old Embed')
				.setDesc(
					'Convert old html element into new code block. Warning: Use with caution.',
				)
				.addButton((component) => {
					component.setButtonText('Convert');
					component.setTooltip('Use with caution');
					component.setWarning();
					component.onClick(async () => {
						new Notice(`Start Conversion`);
						let listFiles = this.app.vault.getMarkdownFiles();
						for (const file of listFiles) {
							let content = await this.app.vault.read(file);
							const htmlRegex = new RegExp(REGEX.HTML, 'gm');
							let elems = content.matchAll(htmlRegex);
							let bReplace = false;
							for (let elem of elems) {
								let description = elem[5] || '';
								description = description.replace(/\n/g, ' ').replace(/\\/g, '\\\\');
								description = he.unescape(description);
								let title = he.unescape(elem[4] || '');
								const origin = elem[0];
								const data = {
									title: title,
									image: elem[2] || '',
									description: description,
									url: elem[1],
								};
								const embed = Mustache.render(
									MarkdownTemplate,
									data,
								);
								if (this.plugin.settings.embedLinksPluginSettings.debug) {
									console.log(
										`Link Embed: Replace\nOrigin\n${origin}\nNew\n${embed}\nBefore\n${content}\nAfter\n${content
											.split(origin)
											.join(embed)}`,
									);
								}
								content = content.split(origin).join(embed);
								// content = content.replace(elem[0], embed);
								bReplace = true;
							}
							const errorMatch = content.match(
								new RegExp(REGEX.ERROR, 'gm'),
							);
							if (
								bReplace &&
								errorMatch != null &&
								errorMatch.length
							) {
								new Notice(`Conversion Fail on ${file.path}`);
								if (this.plugin.settings.embedLinksPluginSettings.debug) {
									console.log('Link Embed: Convert', content);
								}
							} else {
								await this.app.vault.modify(file, content);
							}
						}
						new Notice(`Conversion End`);
					});
				}),
			new Setting(containerEl)
				.setName('Debug')
				.setDesc('Enable debug mode.')
				.addToggle((value) => {
					value.setValue(this.plugin.settings.embedLinksPluginSettings.debug).onChange((value) => {
						this.plugin.settings.embedLinksPluginSettings.debug = value;
						this.plugin.saveSettings();
					});
				}),
			new Setting(containerEl)
				.setName('Delay')
				.setDesc('Add delay before replacing preview.(ms)')
				.addText((value) => {
					value
						.setValue(String(this.plugin.settings.embedLinksPluginSettings.delay))
						.onChange((value) => {
							if (!isNaN(Number(value))) {
								this.plugin.settings.embedLinksPluginSettings.delay = Number(value);
								this.plugin.saveSettings();
							}
						});
				}),
		];

	}
}
