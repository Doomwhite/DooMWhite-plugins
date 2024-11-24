import { Plugin, TFolder, Notice, Modal, App, normalizePath } from 'obsidian';
import BasePluginModule from 'utils/base-plugin-module';
import DailyNotesPluginSettings from './settings.ts';
import { join } from 'path';

export default class DailyNotesPlugin extends BasePluginModule<DailyNotesPluginSettings> {

	constructor(plugin: Plugin) {
		super('DailyNotesPlugin', plugin);
	}

	onLoad(): void {
		// Add context menu item to create today's daily note
		this.addContexMenuItemToFileMenu(
			(file) => file instanceof TFolder, // Condition: only for folders
			"Create daily note in this folder", // Title
			"calendar", // Icon
			(file) => this.createDailyNoteInFolder(file as TFolder) // Action
		);

		// Add context menu item to create a daily note with a custom date
		this.addContexMenuItemToFileMenu(
			(file) => file instanceof TFolder, // Condition: only for folders
			"Create daily note for a specific date", // Title
			"calendar-plus", // Icon
			(file) => this.promptForDateAndCreateDailyNoteInFolder(file as TFolder) // Action
		);

		// Add command to create a daily note with a custom date
		this.plugin.addCommand({
			id: 'create-daily-note-custom-date',
			name: 'Create Daily Note for Specific Date',
			callback: () => this.promptForDateAndCreateDailyNoteCommand(),
		});

		this.plugin.addCommand({
			id: 'create-daily-note-custom-date-teste',
			name: 'Teste',
			callback: () => {
				const attachments = join(this.getVaultPath(), 'attachments')
				this.error('Teste', `${attachments}`)
				const normalize = normalizePath(attachments)
				this.error('Teste', `${normalize}`)
				const path = this.plugin.app.vault.adapter.getResourcePath(normalize)
				this.error('Teste', `${path}`)

				const image = join(attachments, '-GclW3adagAAx4zI.jpeg')
				const normalizeimage = normalizePath(image)
				const imagePath = this.plugin.app.vault.adapter.getResourcePath(normalizeimage)
				this.error('Teste', `${imagePath}`)
			},
		});
	}

	onUnload(): void { }

	// Function to create a daily note in a folder for today's date
	async createDailyNoteInFolder(folder: TFolder) {
		const today = new Date().toISOString().split("T")[0];
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
		const folder = this.plugin.app.fileManager.getNewFileParent(""); // Default to root or last used folder
		if (folder) {
			await this.promptForDateAndCreateDailyNoteInFolder(folder as TFolder);
		} else {
			new Notice("No folder selected.");
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

		const existingFile = this.plugin.app.vault.getAbstractFileByPath(dailyNotePath);
		if (!existingFile) {
			await this.plugin.app.vault.create(dailyNotePath, content);
			this.info(`Created daily note at '${dailyNotePath}'.`, true, 3500);
		} else {
			this.info("Daily note already exists in this folder.", true);
		}
	}

	// Helper function to prompt the user for a date
	async promptForDate(): Promise<string | null> {
		return new Promise((resolve) => {
			const modal = new DatePromptModal(this.plugin.app, (inputDate) => {
				resolve(inputDate);
			});
			modal.open();
		});
	}
}

// Modal to prompt the user for a date
class DatePromptModal extends Modal {
	private onSubmit: (inputDate: string | null) => void;
	private static lastDate: string | null = null;

	constructor(app: App, onSubmit: (inputDate: string | null) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		// Title
		contentEl.createEl("h2", { text: "Enter Date for Daily Note" });

		// Input field
		const input = contentEl.createEl("input", { type: "date" });
		if (DatePromptModal.lastDate) {
			input.value = DatePromptModal.lastDate
		} else {
			input.value = new Date().toISOString().split("T")[0]; // Default to today
		}

		// Submit button
		const submitButton = contentEl.createEl("button", { text: "Create" });
		submitButton.onclick = () => {
			const inputDate = input.value;
			if (inputDate) {
				this.close();
				DatePromptModal.lastDate = inputDate;
				this.onSubmit(inputDate);
			} else {
				new Notice("Please enter a valid date.");
			}
		};

		// Cancel button
		const cancelButton = contentEl.createEl("button", { text: "Cancel", cls: "mod-cta" });
		cancelButton.onclick = () => {
			this.close();
			this.onSubmit(null);
		};
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}