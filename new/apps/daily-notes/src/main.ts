import { isBlank, Logging, LogLevel, PluginUtils } from 'common';
import {
	Menu,
	normalizePath,
	Notice,
	Plugin,
	TAbstractFile,
	TFolder,
} from 'obsidian';
import { join } from 'path';
import { DatePromptModal } from './date-prompt-modal';
import DailyNotesSettingsTab from './settings-tab';

console.log('Entrou no app', isBlank);

export class Settings implements Logging {
	logLevel: LogLevel = LogLevel.Trace;
	toastLogLevel: LogLevel = LogLevel.Trace;
}

export default class DailyNotesPlugin extends Plugin {
	utils!: PluginUtils<Settings>;

	async onload() {
		console.log('Carregou o PluginA', isBlank(false));
		this.utils = await PluginUtils.create<Settings>(this, new Settings());
		this.addSettingTab(new DailyNotesSettingsTab(this.app, this));

		// Add context menu item to create today's daily note
		this.app.workspace.on(
			'file-menu',
			(menu: Menu, file: TAbstractFile) => {
				// Ensure the plugin is loaded and the condition is met (only folders)
				if (file instanceof TFolder) {
					menu.addItem((item) => {
						item.setTitle('Create daily note in this folder')
							.setIcon('calendar')
							.onClick(() =>
								this.createDailyNoteInFolder(file as TFolder),
							);
					});
				}
			},
		);

		// Add context menu item to create a daily note with a custom date
		// this.addContexMenuItemToFileMenu(
		// 	(file) => file instanceof TFolder, // Condition: only for folders
		// 	'Create daily note for a specific date', // Title
		// 	'calendar-plus', // Icon
		// 	(file) =>
		// 		this.promptForDateAndCreateDailyNoteInFolder(file as TFolder), // Action
		// );

		this.app.workspace.on(
			'file-menu',
			(menu: Menu, file: TAbstractFile) => {
				// Ensure the plugin is loaded and the condition is met (only folders)
				if (file instanceof TFolder) {
					menu.addItem((item) => {
						item.setTitle('Create daily note for a specific date')
							.setIcon('calendar-plus')
							.onClick(() =>
								this.promptForDateAndCreateDailyNoteInFolder(
									file as TFolder,
								),
							);
					});
				}
			},
		);

		// Add command to create a daily note with a custom date
		this.addCommand({
			id: 'create-daily-note-custom-date',
			name: 'Create Daily Note for Specific Date',
			callback: () => this.promptForDateAndCreateDailyNoteCommand(),
		});

		this.addCommand({
			id: 'create-daily-note-custom-date-teste',
			name: 'Teste',
			callback: () => {
				const attachments = join(
					this.utils.getVaultPath(),
					'attachments',
				);
				this.utils.error(LogLevel.Error, 'Teste', `${attachments}`);
				const normalize = normalizePath(attachments);
				this.utils.error(LogLevel.Error, 'Teste', `${normalize}`);
				const path = this.app.vault.adapter.getResourcePath(normalize);
				this.utils.error(LogLevel.Error, 'Teste', `${path}`);

				const image = join(attachments, '-GclW3adagAAx4zI.jpeg');
				const normalizeimage = normalizePath(image);
				const imagePath =
					this.app.vault.adapter.getResourcePath(normalizeimage);
				this.utils.error(LogLevel.Error, 'Teste', `${imagePath}`);
			},
		});
	}

	unload() {
		console.log('Descarregou o PluginA', isBlank(true));
	}

	// Function to create a daily note in a folder for today's date
	async createDailyNoteInFolder(folder: TFolder) {
		const today = new Date().toISOString().split('T')[0];
		await this.createDailyNoteForDate(folder, today);
	}

	// Function to prompt the user for a date and create a daily note
	async promptForDateAndCreateDailyNoteInFolder(folder: TFolder) {
		const date = await this.promptForDate();
		if (date) {
			await this.createDailyNoteForDate(folder, date);
		}
	}

	// Command to prompt the user for a folder and date, and create the daily note
	async promptForDateAndCreateDailyNoteCommand() {
		const folder = this.app.fileManager.getNewFileParent(''); // Default to root or last used folder
		if (folder) {
			await this.promptForDateAndCreateDailyNoteInFolder(
				folder as TFolder,
			);
		} else {
			new Notice('No folder selected.');
		}
	}

	// Function to create a daily note for a specific date
	async createDailyNoteForDate(folder: TFolder, date: string) {
		const fileName = `${date}.md`;
		const dailyNotePath = `${folder.path}/${fileName}`;
		const content = `---
related_notes:
  - "[[Daily notes/${date}]]"
---`;

		const existingFile =
			this.app.vault.getAbstractFileByPath(dailyNotePath);
		if (!existingFile) {
			await this.app.vault.create(dailyNotePath, content);
			this.utils.info(
				LogLevel.Info,
				`Created daily note at '${dailyNotePath}'.`,
			);
		} else {
			this.utils.info(
				LogLevel.Info,
				'Daily note already exists in this folder.',
			);
		}
	}

	// Helper function to prompt the user for a date
	async promptForDate(): Promise<string | null> {
		return new Promise((resolve) => {
			const modal = new DatePromptModal(this.app, (inputDate) => {
				resolve(inputDate);
			});
			modal.open();
		});
	}
}
