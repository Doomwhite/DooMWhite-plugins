import { Notice, TFolder } from 'obsidian';
import { BasePluginModule } from './base-plugin-module';
import { PluginSettings } from 'settings';

export class DailyNotesPlugin extends BasePluginModule<PluginSettings> {

	onLoad(): void {
		this.addContexMenuItemToFileMenu(
			(file) => file instanceof TFolder, // Condition: only for folders
			"Create daily note in this folder", // Title
			"calendar", // Icon
			(file) => this.createDailyNoteInFolder(file as TFolder) // Action
		);
	}

	onUnload(): void {
	}

	async createDailyNoteInFolder(folder: TFolder) {
		const today = new Date().toISOString().split("T")[0];
		const fileName = `${today}.md`;
		const dailyNotePath = `${folder.path}/${fileName}`;
		const content = `---
related_notes:
  - "[[Daily notes/${today}]]"
---`;

		const existingFile = this.plugin.app.vault.getAbstractFileByPath(dailyNotePath);
		if (!existingFile) {
			await this.plugin.app.vault.create(dailyNotePath, content);
			new Notice(`Created daily note at '${dailyNotePath}'.`, 3500);
		} else {
			new Notice("Daily note already exists in this folder.");
		}
	}

}
